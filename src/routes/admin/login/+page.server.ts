import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { createMagicLink } from '$lib/server/auth';
import { sendMagicLinkEmail } from '$lib/server/email';

export const load: PageServerLoad = async ({ locals }) => {
	// Se já estiver logado, redireciona para o dashboard
	if (locals.admin) {
		throw redirect(303, '/admin');
	}
};

export const actions: Actions = {
	default: async ({ request, platform, url }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim().toLowerCase();
		const name = formData.get('name')?.toString().trim();
		const cpf = formData.get('cpf')?.toString().trim();

		if (!email || !email.includes('@')) {
			return fail(400, { email, error: 'Por favor, informe um endereço de e-mail válido.' });
		}

		try {
			const db = getDb(platform);
			const { rawToken, admin } = await createMagicLink(db, email, name, cpf);

			const baseUrl = platform?.env?.PUBLIC_APP_URL || url.origin;
			const verifyUrl = `${baseUrl}/admin/auth/verify?token=${rawToken}`;

			const emailResult = await sendMagicLinkEmail({
				to: email,
				url: verifyUrl,
				adminName: admin.name,
				apiKey: platform?.env?.RESEND_API_KEY
			});

			return {
				success: true,
				email,
				devUrl: emailResult.devUrl
			};
		} catch (err: any) {
			console.error('Erro ao gerar magic link:', err);
			return fail(500, { email, error: 'Falha interna ao processar login. Tente novamente.' });
		}
	}
};
