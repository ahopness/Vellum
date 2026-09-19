import type { DatabaseClient, VellumAdmin } from './db';

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
 * Converte string hexadecimal para Uint8Array.
 */
function hexToBuffer(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < bytes.length; i++) {
		bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
	}
	return bytes;
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
 * Cria ou busca um admin e gera um Magic Link válido por 15 minutos.
 */
export async function createMagicLink(
	db: DatabaseClient,
	email: string,
	name?: string,
	cpf?: string
): Promise<{ rawToken: string; admin: VellumAdmin }> {
	const normalizedEmail = email.trim().toLowerCase();

	// Verifica se o admin já existe
	let admin = await db
		.prepare('SELECT * FROM admins WHERE email = ?')
		.bind(normalizedEmail)
		.first<VellumAdmin>();

	if (!admin) {
		const newAdminId = crypto.randomUUID();
		const adminName = name?.trim() || 'Organizador Vellum';
		const adminCpf = cpf?.trim() || '000.000.000-00';

		await db
			.prepare('INSERT INTO admins (id, name, email, cpf) VALUES (?, ?, ?, ?)')
			.bind(newAdminId, adminName, normalizedEmail, adminCpf)
			.run();

		admin = {
			id: newAdminId,
			name: adminName,
			email: normalizedEmail,
			cpf: adminCpf,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};
	}

	const rawToken = generateRandomToken();
	const tokenHash = await sha256(rawToken);
	const linkId = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

	await db
		.prepare(
			'INSERT INTO magic_links (id, admin_id, token_hash, expires_at) VALUES (?, ?, ?, ?)'
		)
		.bind(linkId, admin.id, tokenHash, expiresAt)
		.run();

	return { rawToken, admin };
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
