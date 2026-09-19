import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

/**
 * Salva um arquivo no Cloudflare R2 ou no armazenamento local em desenvolvimento.
 * Retorna a URL relativa para acesso (/api/files/{key}).
 */
export async function uploadToStorage(
	platform: App.Platform | undefined,
	key: string,
	buffer: ArrayBuffer | Uint8Array,
	contentType: string
): Promise<string> {
	// Se R2 estiver vinculado no Cloudflare Pages/Workers
	if (platform?.env?.R2) {
		await platform.env.R2.put(key, buffer, {
			httpMetadata: {
				contentType
			}
		});
		return `/api/files/${key}`;
	}

	// Fallback local para desenvolvimento em disco
	const storageDir = resolve(process.cwd(), '.data/storage');
	const filePath = resolve(storageDir, key);
	const parentDir = dirname(filePath);

	if (!existsSync(parentDir)) {
		mkdirSync(parentDir, { recursive: true });
	}

	const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
	writeFileSync(filePath, uint8);
	return `/api/files/${key}`;
}

/**
 * Recupera um arquivo do Cloudflare R2 ou do disco local.
 */
export async function getFromStorage(
	platform: App.Platform | undefined,
	key: string
): Promise<{ buffer: ArrayBuffer | Uint8Array; contentType: string } | null> {
	if (platform?.env?.R2) {
		const object = await platform.env.R2.get(key);
		if (!object) return null;

		const buffer = await object.arrayBuffer();
		const contentType = object.httpMetadata?.contentType || 'application/octet-stream';
		return { buffer, contentType };
	}

	// Fallback local
	const filePath = resolve(process.cwd(), '.data/storage', key);
	if (!existsSync(filePath)) {
		return null;
	}

	const fileBuffer = readFileSync(filePath);
	// Detecção simples de mime type
	let contentType = 'application/octet-stream';
	if (key.endsWith('.png')) contentType = 'image/png';
	else if (key.endsWith('.jpg') || key.endsWith('.jpeg')) contentType = 'image/jpeg';
	else if (key.endsWith('.webp')) contentType = 'image/webp';
	else if (key.endsWith('.svg')) contentType = 'image/svg+xml';
	else if (key.endsWith('.pdf')) contentType = 'application/pdf';

	return { buffer: fileBuffer, contentType };
}
