import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb, type VellumEvent } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDb(platform);
	const event = await db
		.prepare(
			`SELECT e.id, e.title, e.description, e.logo_url, e.starts_at, e.ends_at, e.theme_color,
			 e.cert_template_url, e.cert_config, a.name AS organizer_name, a.cpf AS organizer_cpf
			 FROM events e
			 LEFT JOIN admins a ON e.admin_id = a.id
			 WHERE e.id = ?`
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
