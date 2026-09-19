import type { Handle } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { verifySessionToken } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get('vellum_session');
	event.locals.admin = null;

	if (sessionCookie) {
		const sessionSecret = event.platform?.env?.SESSION_SECRET;
		const adminId = await verifySessionToken(sessionCookie, sessionSecret);

		if (adminId) {
			const db = getDb(event.platform);
			const admin = await db
				.prepare('SELECT id, name, email, cpf FROM admins WHERE id = ?')
				.bind(adminId)
				.first<App.Locals['admin']>();

			if (admin) {
				event.locals.admin = admin;
			}
		}
	}

	return resolve(event);
};
