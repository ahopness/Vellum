import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb, type VellumEvent } from '$lib/server/db';
import { z } from 'zod';

const AttendanceSchema = z.object({
	eventId: z.string().min(1),
	name: z.string().trim().min(2, 'O nome deve conter pelo menos 2 caracteres.'),
	email: z.string().trim().email('Por favor, informe um e-mail válido.').toLowerCase()
});

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const body = await request.json();
		const validation = AttendanceSchema.safeParse(body);

		if (!validation.success) {
			const firstError = validation.error.errors[0]?.message || 'Dados inválidos.';
			return json({ error: firstError }, { status: 400 });
		}

		const { eventId, name, email } = validation.data;
		const db = getDb(platform);

		// Busca o evento
		const event = await db
			.prepare('SELECT * FROM events WHERE id = ?')
			.bind(eventId)
			.first<VellumEvent>();

		if (!event) {
			return json({ error: 'Evento não encontrado.' }, { status: 404 });
		}

		// Validação temporal de presença rigorosa no servidor (Stack Bible 6.1)
		const now = Date.now();
		const startTolerance = new Date(event.starts_at).getTime() - 15 * 60 * 1000; // -15 min
		const endTolerance = new Date(event.ends_at).getTime() + 15 * 60 * 1000; // +15 min
		const certReleaseTime = new Date(event.ends_at).getTime() - 15 * 60 * 1000; // -15 min do término

		if (now < startTolerance) {
			return json(
				{ error: 'O credenciamento para este evento ainda não foi iniciado.' },
				{ status: 400 }
			);
		}

		if (now > endTolerance) {
			return json(
				{ error: 'O período de registro de presença para este evento expirou.' },
				{ status: 400 }
			);
		}

		// Verifica se o participante já registrou presença
		const existingAttendance = await db
			.prepare('SELECT id FROM attendances WHERE event_id = ? AND participant_email = ?')
			.bind(eventId, email)
			.first<{ id: string }>();

		let alreadyCheckedIn = false;

		if (!existingAttendance) {
			// Registra a presença (LGPD: APENAS NOME E EMAIL, NUNCA O CPF)
			const attendanceId = crypto.randomUUID();
			await db
				.prepare(
					'INSERT INTO attendances (id, event_id, participant_name, participant_email) VALUES (?, ?, ?, ?)'
				)
				.bind(attendanceId, eventId, name, email)
				.run();
		} else {
			alreadyCheckedIn = true;
		}

		const canDownloadCert = now >= certReleaseTime;

		return json({
			success: true,
			alreadyCheckedIn,
			canDownloadCert,
			certReleaseTime,
			event: {
				id: event.id,
				title: event.title,
				cert_template_url: event.cert_template_url,
				cert_config: event.cert_config
			}
		});
	} catch (err: any) {
		console.error('Erro ao processar registro de presença:', err);
		return json({ error: 'Falha interna ao registrar presença.' }, { status: 500 });
	}
};
