import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb, type VellumEvent } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDb(platform);
	const event = await db
		.prepare(
			`SELECT id, title, description, starts_at, ends_at, theme_color,
			 cert_template_url, cert_config FROM events WHERE id = ?`
		)
		.bind(params.id)
		.first<VellumEvent>();

	if (!event) {
		throw error(404, 'Evento não encontrado ou link expirado.');
	}

	return {
		event
	};
};
