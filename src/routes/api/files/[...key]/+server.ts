import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFromStorage } from '$lib/server/storage';

export const GET: RequestHandler = async ({ params, platform }) => {
	const key = params.key;
	if (!key) {
		throw error(400, 'Chave de arquivo não informada.');
	}

	const file = await getFromStorage(platform, key);
	if (!file) {
		throw error(404, 'Arquivo não encontrado no armazenamento.');
	}

	return new Response(file.buffer as any, {
		headers: {
			'Content-Type': file.contentType,
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
