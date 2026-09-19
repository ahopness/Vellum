import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { verifyAndConsumeMagicLink, createSessionToken } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url, cookies, platform }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		throw redirect(303, '/admin/login?error=invalid_token');
	}

	const db = getDb(platform);
	const admin = await verifyAndConsumeMagicLink(db, token);

	if (!admin) {
		throw redirect(303, '/admin/login?error=invalid_token');
	}

	const sessionSecret = platform?.env?.SESSION_SECRET;
	const sessionToken = await createSessionToken(admin.id, sessionSecret);

	cookies.set('vellum_session', sessionToken, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 7 * 24 * 60 * 60 // 7 dias
	});

	throw redirect(303, '/admin');
};
