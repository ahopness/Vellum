import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db';
import {
	getAdminByEmail,
	registerAdmin,
	createMagicLinkForAdmin
} from '$lib/server/auth';
import { sendMagicLinkEmail, getResendApiKey, getResendFromEmail } from '$lib/server/email';
import { cleanDigits, isValidCpfLength } from '$lib/utils/formatters';

export const load: PageServerLoad = async ({ locals }) => {
	// Se já estiver logado, redireciona para o dashboard
	if (locals.admin) {
		throw redirect(303, '/admin');
	}
};

export const actions: Actions = {
	// Ação de login para administradores já existentes
	login: async ({ request, platform, url }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim().toLowerCase();

		if (!email || !email.includes('@')) {
			return fail(400, {
				mode: 'login',
				email,
				error: 'Por favor, informe um endereço de e-mail válido.'
			});
		}

		try {
			const db = getDb(platform);
			const admin = await getAdminByEmail(db, email);

			if (!admin) {
				return fail(404, {
					mode: 'register',
					email,
					notRegistered: true,
					error:
						'Administrador não encontrado. Por favor, conclua o cadastro completo com Nome e CPF.'
				});
			}

			const { rawToken } = await createMagicLinkForAdmin(db, admin.id);
			const rawBase = env.PUBLIC_APP_URL || platform?.env?.PUBLIC_APP_URL || url.origin;
			const baseUrl = rawBase.replace(/\/$/, '');
			const verifyUrl = `${baseUrl}/admin/auth/verify?token=${rawToken}`;

			const apiKey = getResendApiKey(platform);
			const fromEmail = getResendFromEmail(platform);

			const emailResult = await sendMagicLinkEmail({
				to: email,
				url: verifyUrl,
				adminName: admin.name,
				apiKey,
				fromEmail
			});

			if (!emailResult.success && !emailResult.devUrl) {
				return fail(500, {
					mode: 'login',
					email,
					error: emailResult.error || 'Falha ao enviar e-mail com o link de acesso.'
				});
			}

			return {
				success: true,
				email,
				devUrl: emailResult.devUrl
			};
		} catch (err: any) {
			console.error('Erro ao processar login:', err);
			return fail(500, {
				mode: 'login',
				email,
				error: 'Falha interna ao processar login. Tente novamente.'
			});
		}
	},

	// Ação de cadastro completo para novos administradores
	register: async ({ request, platform, url }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim().toLowerCase();
		const name = formData.get('name')?.toString().trim();
		const cpf = formData.get('cpf')?.toString().trim();

		if (!email || !email.includes('@')) {
			return fail(400, {
				mode: 'register',
				email,
				name,
				cpf,
				error: 'Informe um e-mail válido.'
			});
		}

		if (!name || name.length < 3) {
			return fail(400, {
				mode: 'register',
				email,
				name,
				cpf,
				error: 'O Nome Completo deve ter pelo menos 3 caracteres.'
			});
		}

		if (!cpf || !isValidCpfLength(cpf)) {
			return fail(400, {
				mode: 'register',
				email,
				name,
				cpf,
				error: 'O CPF do organizador é obrigatório e deve conter 11 dígitos numéricos.'
			});
		}

		try {
			const db = getDb(platform);
			const existing = await getAdminByEmail(db, email);
			if (existing) {
				return fail(400, {
					mode: 'login',
					email,
					error: 'Este e-mail já possui cadastro. Faça login diretamente.'
				});
			}

			const admin = await registerAdmin(db, { name, email, cpf });
			const { rawToken } = await createMagicLinkForAdmin(db, admin.id);

			const rawBase = env.PUBLIC_APP_URL || platform?.env?.PUBLIC_APP_URL || url.origin;
			const baseUrl = rawBase.replace(/\/$/, '');
			const verifyUrl = `${baseUrl}/admin/auth/verify?token=${rawToken}`;

			const apiKey = getResendApiKey(platform);
			const fromEmail = getResendFromEmail(platform);

			const emailResult = await sendMagicLinkEmail({
				to: email,
				url: verifyUrl,
				adminName: admin.name,
				apiKey,
				fromEmail
			});

			if (!emailResult.success && !emailResult.devUrl) {
				return fail(500, {
					mode: 'register',
					email,
					name,
					cpf,
					error: emailResult.error || 'Falha ao enviar e-mail com link de acesso.'
				});
			}

			return {
				success: true,
				isNewRegistration: true,
				email,
				devUrl: emailResult.devUrl
			};
		} catch (err: any) {
			console.error('Erro ao cadastrar administrador:', err);
			return fail(500, {
				mode: 'register',
				email,
				name,
				cpf,
				error: err.message || 'Falha ao cadastrar organizador.'
			});
		}
	}
};
