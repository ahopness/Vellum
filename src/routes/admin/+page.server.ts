import type { PageServerLoad } from './$types';
import { getDb, type VellumEvent } from '$lib/server/db';

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
