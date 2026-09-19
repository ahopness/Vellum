import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { deleteAdminAccount } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.admin) {
		throw redirect(303, '/admin/login');
	}
	throw redirect(303, '/admin');
};

export const actions: Actions = {
	default: async ({ locals, request, platform, cookies }) => {
		const admin = locals.admin;
		if (!admin) {
			throw redirect(303, '/admin/login');
		}

		const formData = await request.formData();
		const confirmation = formData.get('confirmation')?.toString().trim();

		// Exige confirmação digitando "EXCLUIR" ou o próprio e-mail cadastrado
		const isConfirmed =
			confirmation?.toUpperCase() === 'EXCLUIR' ||
			confirmation?.toLowerCase() === admin.email.toLowerCase();

		if (!isConfirmed) {
			return fail(400, {
				error: 'Confirmação incorreta. Digite EXCLUIR ou seu e-mail para autorizar a exclusão.'
			});
		}

		try {
			const db = getDb(platform);
			await deleteAdminAccount(db, platform, admin.id);

			// Encerra a sessão removendo o cookie HttpOnly
			cookies.delete('vellum_session', { path: '/' });
			locals.admin = null;
		} catch (err: any) {
			console.error('Erro ao excluir conta de administrador:', err);
			return fail(500, {
				error: 'Falha interna ao processar a exclusão da conta. Tente novamente.'
			});
		}

		throw redirect(303, '/?account_deleted=1');
	}
};
