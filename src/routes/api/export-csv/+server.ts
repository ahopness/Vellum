import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb, type VellumEvent, type VellumAttendance } from '$lib/server/db';
import { generateAttendanceCsv } from '$lib/utils/csv';

export const GET: RequestHandler = async ({ url, locals, platform }) => {
	const admin = locals.admin;
	if (!admin) {
		throw error(401, 'Acesso não autorizado.');
	}

	const eventId = url.searchParams.get('eventId');
	if (!eventId) {
		throw error(400, 'Identificador do evento não informado.');
	}

	const db = getDb(platform);

	// Verifica se o evento pertence ao administrador
	const event = await db
		.prepare('SELECT id, title FROM events WHERE id = ? AND admin_id = ?')
		.bind(eventId, admin.id)
		.first<VellumEvent>();

	if (!event) {
		throw error(404, 'Evento não encontrado.');
	}

	// Busca todas as presenças
	const attendancesResult = await db
		.prepare(
			'SELECT participant_name, participant_email, checked_in_at FROM attendances WHERE event_id = ? ORDER BY participant_name ASC'
		)
		.bind(eventId)
		.all<VellumAttendance>();

	const attendances = attendancesResult.results || [];
	const csvContent = generateAttendanceCsv(attendances);

	const cleanTitle = event.title
		.replace(/[^a-zA-Z0-9À-ÿ]/g, '_')
		.slice(0, 30);
	const filename = `Presenca_${cleanTitle}.csv`;

	return new Response(csvContent, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}"`,
			'Cache-Control': 'no-store'
		}
	});
};
