/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export function maskCpf(val: string): string {
	const digits = val.replace(/\D/g, '').slice(0, 11);
	if (digits.length <= 3) return digits;
	if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
	if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
	return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Remove qualquer caractere não numérico
 */
export function cleanDigits(val: string): string {
	return val.replace(/\D/g, '');
}

/**
 * Validação simplificada de formato de CPF (11 dígitos numéricos)
 */
export function isValidCpfLength(val: string): boolean {
	return cleanDigits(val).length === 11;
}

/**
 * Faz o parse seguro de strings de data vindas do SQLite ou ISO 8601.
 * Trata o formato padrão do SQLite "YYYY-MM-DD HH:MM:SS" adicionando 'T' e 'Z' (UTC).
 */
export function parseDateSafe(val: string | null | undefined): Date | null {
	if (!val) return null;
	const trimmed = val.trim();
	if (!trimmed) return null;
	// Formato comum do SQLite CURRENT_TIMESTAMP "YYYY-MM-DD HH:MM:SS"
	if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(trimmed)) {
		const iso = trimmed.replace(' ', 'T') + (trimmed.endsWith('Z') ? '' : 'Z');
		const d = new Date(iso);
		return isNaN(d.getTime()) ? null : d;
	}
	const d = new Date(trimmed);
	return isNaN(d.getTime()) ? null : d;
}

/**
 * Formata data para o padrão pt-BR: DD/MM/AAAA
 */
export function formatDate(isoString: string): string {
	const d = parseDateSafe(isoString);
	if (!d) return '';
	return d.toLocaleDateString('pt-BR', {
		timeZone: 'America/Sao_Paulo',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});
}

/**
 * Formata horário para o padrão pt-BR: HH:mm (ou HH:mm:ss se includeSeconds = true)
 */
export function formatTime(isoString: string, includeSeconds = false): string {
	const d = parseDateSafe(isoString);
	if (!d) return '';
	return d.toLocaleTimeString('pt-BR', {
		timeZone: 'America/Sao_Paulo',
		hour: '2-digit',
		minute: '2-digit',
		...(includeSeconds ? { second: '2-digit' } : {})
	});
}

/**
 * Formata data e hora para exibição editorial
 */
export function formatDateTime(isoString: string, includeSeconds = false): string {
	const d = parseDateSafe(isoString);
	if (!d) return '';
	return `${formatDate(isoString)} às ${formatTime(isoString, includeSeconds)}`;
}

export type EventStatus = 'upcoming' | 'open' | 'ended';

/**
 * Determina o status temporal de credenciamento do evento:
 * - Tolerância de início: -15 min antes de starts_at
 * - Tolerância de término de presença: +15 min após ends_at
 */
export function getAttendanceWindow(startsAt: string, endsAt: string) {
	const now = Date.now();
	const startTime = new Date(startsAt).getTime();
	const endTime = new Date(endsAt).getTime();

	const openTime = startTime - 15 * 60 * 1000; // -15 min
	const closeTime = endTime + 15 * 60 * 1000;  // +15 min
	const certReleaseTime = endTime - 15 * 60 * 1000; // -15 min antes do encerramento

	const canCheckIn = now >= openTime && now <= closeTime;
	const isUpcoming = now < openTime;
	const isEnded = now > closeTime;
	const canDownloadCert = now >= certReleaseTime;

	return {
		now,
		openTime,
		closeTime,
		certReleaseTime,
		canCheckIn,
		isUpcoming,
		isEnded,
		canDownloadCert
	};
}
