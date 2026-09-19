import type { DatabaseClient, VellumAdmin, VellumEvent } from './db';
import { extractStorageKey, deleteFromStorage } from './storage';

const DEV_SESSION_SECRET = 'vellum-dev-session-secret-key-32-chars-long!';

/**
 * Converte Uint8Array para string hexadecimal.
 */
function bufferToHex(buffer: ArrayBuffer): string {
	return Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Gera um hash SHA-256 de uma string usando Web Crypto.
 */
export async function sha256(text: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	return bufferToHex(hashBuffer);
}

/**
 * Gera um token seguro aleatório de 32 bytes (64 caracteres hex).
 */
export function generateRandomToken(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return bufferToHex(array.buffer);
}

/**
 * Gera uma assinatura HMAC-SHA256.
 */
async function signHmac(data: string, secret: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
	return bufferToHex(signature);
}

/**
 * Cria um token de sessão assinado contendo o adminId e data de expiração.
 * Formato: base64(payload).signature
 */
export async function createSessionToken(adminId: string, secret?: string): Promise<string> {
	const key = secret || DEV_SESSION_SECRET;
	const payload = JSON.stringify({
		adminId,
		exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 dias
	});
	const encodedPayload = btoa(payload);
	const signature = await signHmac(encodedPayload, key);
	return `${encodedPayload}.${signature}`;
}

/**
 * Valida o token de sessão e retorna o adminId se válido e não expirado.
 */
export async function verifySessionToken(token: string, secret?: string): Promise<string | null> {
	try {
		const key = secret || DEV_SESSION_SECRET;
		const parts = token.split('.');
		if (parts.length !== 2) return null;

		const [encodedPayload, signature] = parts;
		const expectedSignature = await signHmac(encodedPayload, key);
		if (signature !== expectedSignature) return null;

		const payloadStr = atob(encodedPayload);
		const payload = JSON.parse(payloadStr);

		if (!payload.adminId || !payload.exp || Date.now() > payload.exp) {
			return null;
		}

		return payload.adminId;
	} catch {
		return null;
	}
}

/**
 * Busca administrador por e-mail no banco de dados.
 */
export async function getAdminByEmail(
	db: DatabaseClient,
	email: string
): Promise<VellumAdmin | null> {
	const normalizedEmail = email.trim().toLowerCase();
	return await db
		.prepare('SELECT * FROM admins WHERE email = ?')
		.bind(normalizedEmail)
		.first<VellumAdmin>();
}

/**
 * Cadastra um novo administrador no sistema (requer Nome, Email e CPF).
 */
export async function registerAdmin(
	db: DatabaseClient,
	data: { name: string; email: string; cpf: string }
): Promise<VellumAdmin> {
	const normalizedEmail = data.email.trim().toLowerCase();
	const existing = await getAdminByEmail(db, normalizedEmail);
	if (existing) {
		throw new Error('Este e-mail já está cadastrado.');
	}

	const newAdminId = crypto.randomUUID();
	const adminName = data.name.trim();
	const adminCpf = data.cpf.trim();

	await db
		.prepare('INSERT INTO admins (id, name, email, cpf) VALUES (?, ?, ?, ?)')
		.bind(newAdminId, adminName, normalizedEmail, adminCpf)
		.run();

	return {
		id: newAdminId,
		name: adminName,
		email: normalizedEmail,
		cpf: adminCpf,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	};
}

/**
 * Gera um Magic Link seguro de 15 minutos para um administrador cadastrado.
 */
export async function createMagicLinkForAdmin(
	db: DatabaseClient,
	adminId: string
): Promise<{ rawToken: string }> {
	const rawToken = generateRandomToken();
	const tokenHash = await sha256(rawToken);
	const linkId = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

	await db
		.prepare(
			'INSERT INTO magic_links (id, admin_id, token_hash, expires_at) VALUES (?, ?, ?, ?)'
		)
		.bind(linkId, adminId, tokenHash, expiresAt)
		.run();

	return { rawToken };
}

/**
 * Valida o Magic Link e marca como usado (single-use). Retorna o admin se válido.
 */
export async function verifyAndConsumeMagicLink(
	db: DatabaseClient,
	rawToken: string
): Promise<VellumAdmin | null> {
	const tokenHash = await sha256(rawToken);

	const link = await db
		.prepare(
			'SELECT * FROM magic_links WHERE token_hash = ? AND used_at IS NULL'
		)
		.bind(tokenHash)
		.first<{ id: string; admin_id: string; expires_at: string }>();

	if (!link) {
		return null;
	}

	// Verifica expiração
	if (new Date(link.expires_at).getTime() < Date.now()) {
		return null;
	}

	// Marca como usado
	await db
		.prepare('UPDATE magic_links SET used_at = CURRENT_TIMESTAMP WHERE id = ?')
		.bind(link.id)
		.run();

	// Retorna admin correspondente
	const admin = await db
		.prepare('SELECT * FROM admins WHERE id = ?')
		.bind(link.admin_id)
		.first<VellumAdmin>();

	return admin || null;
}

/**
 * Exclui permanentemente uma conta de administrador e propaga em cascata
 * por todos os seus eventos, arquivos no R2, presenças e magic links no D1.
 * CUIDADO: Operação estritamente delimitada pelo adminId fornecido.
 */
export async function deleteAdminAccount(
	db: DatabaseClient,
	platform: App.Platform | undefined,
	adminId: string
): Promise<{ success: boolean; eventsDeleted: number }> {
	if (!adminId || typeof adminId !== 'string') {
		throw new Error('ID de administrador inválido para exclusão.');
	}

	// 1. Busca todos os eventos pertencentes EXCLUSIVAMENTE a este administrador
	const eventsResult = await db
		.prepare('SELECT id, logo_url, cert_template_url FROM events WHERE admin_id = ?')
		.bind(adminId)
		.all<Pick<VellumEvent, 'id' | 'logo_url' | 'cert_template_url'>>();

	const events = eventsResult.results || [];

	// 2. Limpa todos os arquivos do R2 (logos e templates de certificados) vinculados a esses eventos
	for (const ev of events) {
		const logoKey = extractStorageKey(ev.logo_url);
		if (logoKey) {
			await deleteFromStorage(platform, logoKey);
		}
		const templateKey = extractStorageKey(ev.cert_template_url);
		if (templateKey) {
			await deleteFromStorage(platform, templateKey);
		}

		// 3. Exclui as presenças deste evento no D1
		await db.prepare('DELETE FROM attendances WHERE event_id = ?').bind(ev.id).run();
	}

	// 4. Exclui os eventos deste administrador no D1
	await db.prepare('DELETE FROM events WHERE admin_id = ?').bind(adminId).run();

	// 5. Exclui os magic links deste administrador no D1
	await db.prepare('DELETE FROM magic_links WHERE admin_id = ?').bind(adminId).run();

	// 6. Exclui o registro do administrador no D1
	await db.prepare('DELETE FROM admins WHERE id = ?').bind(adminId).run();

	return { success: true, eventsDeleted: events.length };
}

