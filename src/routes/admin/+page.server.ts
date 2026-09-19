import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb, type VellumEvent } from '$lib/server/db';
import { extractStorageKey, deleteFromStorage } from '$lib/server/storage';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const adminId = locals.admin!.id;
	const db = getDb(platform);

	// Busca eventos do administrador
	const eventsResult = await db
		.prepare('SELECT * FROM events WHERE admin_id = ? ORDER BY starts_at DESC')
		.bind(adminId)
		.all<VellumEvent>();

	const events = eventsResult.results || [];

	// Busca contagem de participantes por evento
	const eventsWithCount = await Promise.all(
		events.map(async (ev) => {
			const countResult = await db
				.prepare('SELECT COUNT(*) as count FROM attendances WHERE event_id = ?')
				.bind(ev.id)
				.first<{ count: number }>();

			return {
				...ev,
				attendeesCount: countResult?.count || 0
			};
		})
	);

	return {
		events: eventsWithCount
	};
};

export const actions: Actions = {
	delete: async ({ request, locals, platform }) => {
		const admin = locals.admin;
		if (!admin) {
			throw redirect(303, '/admin/login');
		}

		const formData = await request.formData();
		const eventId = formData.get('eventId')?.toString();
		if (!eventId) {
			return fail(400, { error: 'ID do evento não fornecido.' });
		}

		const db = getDb(platform);
		const event = await db
			.prepare(
				'SELECT id, admin_id, logo_url, cert_template_url FROM events WHERE id = ? AND admin_id = ?'
			)
			.bind(eventId, admin.id)
			.first<VellumEvent>();

		if (!event) {
			return fail(404, { error: 'Evento não encontrado ou permissão negada.' });
		}

		// 1. Limpeza no Cloudflare R2
		const logoKey = extractStorageKey(event.logo_url);
		if (logoKey) await deleteFromStorage(platform, logoKey);

		const templateKey = extractStorageKey(event.cert_template_url);
		if (templateKey) await deleteFromStorage(platform, templateKey);

		// 2. Limpeza em cascata no Cloudflare D1
		await db.prepare('DELETE FROM attendances WHERE event_id = ?').bind(eventId).run();
		await db
			.prepare('DELETE FROM events WHERE id = ? AND admin_id = ?')
			.bind(eventId, admin.id)
			.run();

		return { success: true };
	}
};
