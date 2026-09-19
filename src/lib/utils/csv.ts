/**
 * Sanitiza campos contra CSV Injection (quando aberto no Excel, LibreOffice, etc.).
 * Prefixos como =, +, -, @ podem disparar execução de fórmulas arbitrárias.
 */
export function sanitizeCsvField(val: string): string {
	if (!val) return '';
	const trimmed = val.trim();
	if (/^[=+@-]/i.test(trimmed)) {
		return `'${trimmed}`;
	}
	// Se contiver vírgula, aspas ou quebra de linha, envolve em aspas duplas escapando aspas existentes
	if (/[",\n\r]/.test(trimmed)) {
		return `"${trimmed.replace(/"/g, '""')}"`;
	}
	return trimmed;
}

/**
 * Gera string CSV com cabeçalho padrão e suporte a UTF-8 BOM para o Microsoft Excel.
 */
export function generateAttendanceCsv(
	attendances: Array<{
		participant_name: string;
		participant_email: string;
		checked_in_at: string;
	}>
): string {
	// BOM (Byte Order Mark) para UTF-8 garante que o Excel renderize acentos corretamente no Windows
	const BOM = '\uFEFF';
	const headers = ['NOME DO PARTICIPANTE', 'E-MAIL', 'DATA E HORA DO CREDENCIAMENTO'];
	
	const rows = attendances.map((item) => {
		const formattedDate = new Date(item.checked_in_at).toLocaleString('pt-BR', {
			timeZone: 'America/Sao_Paulo'
		});
		return [
			sanitizeCsvField(item.participant_name),
			sanitizeCsvField(item.participant_email),
			sanitizeCsvField(formattedDate)
		].join(';');
	});

	return BOM + [headers.join(';'), ...rows].join('\r\n');
}
