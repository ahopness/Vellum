import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getDb } from '$lib/server/db';
import { uploadToStorage } from '$lib/server/storage';

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
		const admin = locals.admin;
		if (!admin) {
			throw redirect(303, '/admin/login');
		}

		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim();
		const description = formData.get('description')?.toString().trim() || null;
		const themeColor = formData.get('theme_color')?.toString().trim() || '#2563eb';
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

		const tzOffsetRaw = formData.get('tz_offset')?.toString();
		// Deslocamento padrão para Horário de Brasília (UTC-3 = 180 min) se não informado
		const tzOffset = tzOffsetRaw !== undefined && tzOffsetRaw !== '' ? parseInt(tzOffsetRaw, 10) : 180;

		function parseDateTimeToUtc(raw: string, offsetMinutes: number): string {
			if (raw.endsWith('Z') || raw.includes('+') || (raw.length > 19 && raw.includes('-'))) {
				return new Date(raw).toISOString();
			}
			const dateParsed = new Date(raw);
			return new Date(dateParsed.getTime() + offsetMinutes * 60 * 1000).toISOString();
		}

		const startsAt = parseDateTimeToUtc(startsAtRaw, tzOffset);
		const endsAt = parseDateTimeToUtc(endsAtRaw, tzOffset);

		if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
			return fail(400, { error: 'O término do evento deve ser posterior ao horário de início.' });
		}

		let certConfig = certConfigRaw;
		if (!certConfig) {
			certConfig = JSON.stringify({
				name_field: { x: 600, y: 440, font_size: 32, align: 'center', color: '#18181b', enabled: true },
				cpf_field: { x: 600, y: 500, font_size: 16, align: 'center', color: '#52525b', enabled: true },
				organizer_name_field: { x: 300, y: 680, font_size: 16, align: 'center', color: '#18181b', enabled: true },
				organizer_cpf_field: { x: 300, y: 710, font_size: 12, align: 'center', color: '#52525b', enabled: true },
				date_field: { x: 950, y: 700, font_size: 14, align: 'right', color: '#71717a', enabled: true },
				reference_width: 1200,
				reference_height: 800
			});
		}

		const eventId = crypto.randomUUID().slice(0, 8);
		const db = getDb(platform);

		// Processa upload de Logo no Cloudflare R2
		let logoUrl: string | null = null;
		const logoFile = formData.get('logo') as File | null;
		if (logoFile && logoFile.size > 0) {
			try {
				const buffer = await logoFile.arrayBuffer();
				const ext = logoFile.name.split('.').pop()?.toLowerCase() || 'png';
				const key = `logos/${eventId}-${Date.now()}.${ext}`;
				logoUrl = await uploadToStorage(platform, key, new Uint8Array(buffer), logoFile.type || 'image/png');
			} catch (err) {
				console.error('Falha ao fazer upload da logo no R2:', err);
			}
		}

		// Processa template do certificado no Cloudflare R2 se enviado como arquivo
		let finalCertTemplateUrl = certTemplateUrl;
		const templateFile = formData.get('template_file') as File | null;
		if (templateFile && templateFile.size > 0) {
			try {
				const buffer = await templateFile.arrayBuffer();
				const ext = templateFile.name.split('.').pop()?.toLowerCase() || 'png';
				const key = `templates/${eventId}-${Date.now()}.${ext}`;
				finalCertTemplateUrl = await uploadToStorage(
					platform,
					key,
					new Uint8Array(buffer),
					templateFile.type || 'image/png'
				);
			} catch (err) {
				console.error('Falha ao fazer upload do template no R2:', err);
			}
		}

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
					logoUrl,
					themeColor,
					startsAt,
					endsAt,
					finalCertTemplateUrl,
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
