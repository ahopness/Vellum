import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { getDb, type VellumEvent, type VellumAttendance } from '$lib/server/db';
import { extractStorageKey, deleteFromStorage } from '$lib/server/storage';

export const load: PageServerLoad = async ({ params, locals, platform, url }) => {
	const admin = locals.admin;
	if (!admin) {
		throw redirect(303, '/admin/login');
	}

	const db = getDb(platform);
	const event = await db
		.prepare('SELECT * FROM events WHERE id = ? AND admin_id = ?')
		.bind(params.id, admin.id)
		.first<VellumEvent>();

	if (!event) {
		throw error(404, 'Evento não encontrado ou você não possui permissão para gerenciá-lo.');
	}

	// Busca presenças registradas
	const attendancesResult = await db
		.prepare(
			'SELECT * FROM attendances WHERE event_id = ? ORDER BY checked_in_at DESC'
		)
		.bind(event.id)
		.all<VellumAttendance>();

	const attendances = attendancesResult.results || [];
	const rawBase = env.PUBLIC_APP_URL || platform?.env?.PUBLIC_APP_URL || url.origin;
	const publicUrl = `${rawBase.replace(/\/$/, '')}/e/${event.id}`;

	return {
		event,
		attendances,
		publicUrl,
		organizer: {
			name: admin.name,
			cpf: admin.cpf
		}
	};
};

export const actions: Actions = {
	delete: async ({ params, locals, platform }) => {
		const admin = locals.admin;
		if (!admin) {
			throw redirect(303, '/admin/login');
		}

		const eventId = params.id;
		const db = getDb(platform);

		// 1. Busca o evento e valida permissão do administrador
		const event = await db
			.prepare(
				'SELECT id, admin_id, logo_url, cert_template_url FROM events WHERE id = ? AND admin_id = ?'
			)
			.bind(eventId, admin.id)
			.first<VellumEvent>();

		if (!event) {
			return fail(404, { error: 'Evento não encontrado ou permissão negada.' });
		}

		// 2. Propagação no Cloudflare R2: Remoção da Logo e do Template Gráfico
		const logoKey = extractStorageKey(event.logo_url);
		if (logoKey) {
			await deleteFromStorage(platform, logoKey);
		}

		const templateKey = extractStorageKey(event.cert_template_url);
		if (templateKey) {
			await deleteFromStorage(platform, templateKey);
		}

		// 3. Propagação no Cloudflare D1: Exclusão em cascata de presenças e evento
		await db
			.prepare('DELETE FROM attendances WHERE event_id = ?')
			.bind(eventId)
			.run();

		await db
			.prepare('DELETE FROM events WHERE id = ? AND admin_id = ?')
			.bind(eventId, admin.id)
			.run();

		throw redirect(303, '/admin?deleted=true');
	}
};
