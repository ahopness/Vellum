import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Permite acesso às rotas de login e verificação sem autenticação
	if (url.pathname.startsWith('/admin/login') || url.pathname.startsWith('/admin/auth/verify')) {
		return {
			admin: locals.admin
		};
	}

	if (!locals.admin) {
		throw redirect(303, `/admin/login?redirect=${encodeURIComponent(url.pathname)}`);
	}

	return {
		admin: locals.admin
	};
};
