import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	cookies.delete('vellum_session', { path: '/' });
	throw redirect(303, '/');
};

export const actions: Actions = {
	default: async ({ cookies }) => {
		cookies.delete('vellum_session', { path: '/' });
		throw redirect(303, '/');
	}
};
