import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getDb } from '$lib/server/db';

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
		const admin = locals.admin;
		if (!admin) {
			throw redirect(303, '/admin/login');
		}

		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim();
		const description = formData.get('description')?.toString().trim() || null;
		const themeColor = formData.get('theme_color')?.toString().trim() || '#3f3f46';
		const startsAtRaw = formData.get('starts_at')?.toString();
		const endsAtRaw = formData.get('ends_at')?.toString();
		const certTemplateUrl = formData.get('cert_template_url')?.toString().trim() || '';
		const certConfigRaw = formData.get('cert_config')?.toString();

		if (!title) {
			return fail(400, { error: 'O título do evento é obrigatório.' });
		}
		if (!startsAtRaw || !endsAtRaw) {
			return fail(400, { error: 'As datas de início e término são obrigatórias.' });
		}

		const startsAt = new Date(startsAtRaw).toISOString();
		const endsAt = new Date(endsAtRaw).toISOString();

		if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
			return fail(400, { error: 'O término do evento deve ser posterior ao horário de início.' });
		}

		let certConfig = certConfigRaw;
		if (!certConfig) {
			certConfig = JSON.stringify({
				name_field: { x: 600, y: 440, font_size: 32, align: 'center', color: '#18181b' },
				cpf_field: { x: 600, y: 500, font_size: 16, align: 'center', color: '#52525b' },
				date_field: { x: 950, y: 700, font_size: 14, align: 'right', color: '#71717a' },
				reference_width: 1200,
				reference_height: 800
			});
		}

		const eventId = crypto.randomUUID().slice(0, 8); // Identificador curto elegante
		const db = getDb(platform);

		try {
			await db
				.prepare(
					`INSERT INTO events (
						id, admin_id, title, description, logo_url, theme_color,
						starts_at, ends_at, cert_template_url, cert_config
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.bind(
					eventId,
					admin.id,
					title,
					description,
					null,
					themeColor,
					startsAt,
					endsAt,
					certTemplateUrl,
					certConfig
				)
				.run();
		} catch (err: any) {
			console.error('Erro ao salvar evento:', err);
			return fail(500, { error: 'Falha ao registrar evento no banco de dados.' });
		}

		throw redirect(303, `/admin/events/${eventId}`);
	}
};
