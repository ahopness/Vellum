import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { getDb, type VellumEvent, type VellumAttendance } from '$lib/server/db';

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
		publicUrl
	};
};
