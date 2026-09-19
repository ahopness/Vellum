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
 * Formata data para o padrão pt-BR: DD/MM/AAAA
 */
export function formatDate(isoString: string): string {
	if (!isoString) return '';
	return new Date(isoString).toLocaleDateString('pt-BR', {
		timeZone: 'America/Sao_Paulo',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});
}

/**
 * Formata horário para o padrão pt-BR: HH:mm
 */
export function formatTime(isoString: string): string {
	if (!isoString) return '';
	return new Date(isoString).toLocaleTimeString('pt-BR', {
		timeZone: 'America/Sao_Paulo',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * Formata data e hora para exibição editorial
 */
export function formatDateTime(isoString: string): string {
	if (!isoString) return '';
	return `${formatDate(isoString)} às ${formatTime(isoString)}`;
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
