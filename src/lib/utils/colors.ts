/**
 * Calcula a luminância relativa de uma cor Hexadecimal e determina
 * se o texto em cima dela deve ser claro (#ffffff) ou escuro (#18181b).
 */
export function getContrastTextColor(hexColor: string): '#ffffff' | '#18181b' {
	let hex = hexColor.replace('#', '').trim();
	if (hex.length === 3) {
		hex = hex
			.split('')
			.map((c) => c + c)
			.join('');
	}

	if (hex.length !== 6) {
		return '#ffffff';
	}

	const r = parseInt(hex.substring(0, 2), 16) / 255;
	const g = parseInt(hex.substring(2, 4), 16) / 255;
	const b = parseInt(hex.substring(4, 6), 16) / 255;

	// Função de conversão sRGB para luminância perceptível (WCAG 2.1)
	const toLinear = (c: number) =>
		c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

	const lum = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

	return lum > 0.4 ? '#18181b' : '#ffffff';
}

/**
 * Paleta editorial expandida: tonalidades vibrantes, expressivas e de alto contraste
 */
export const EDITORIAL_THEMES = [
	{ name: 'Azul Cobalto', hex: '#2563eb' },
	{ name: 'Índigo Elétrico', hex: '#4f46e5' },
	{ name: 'Violeta Imperial', hex: '#7c3aed' },
	{ name: 'Roxo Púrpura', hex: '#9333ea' },
	{ name: 'Carmesim Rubi', hex: '#e11d48' },
	{ name: 'Vermelho Nobre', hex: '#dc2626' },
	{ name: 'Borgonha Intenso', hex: '#9f1239' },
	{ name: 'Rosa Choque', hex: '#db2777' },
	{ name: 'Laranja Solar', hex: '#ea580c' },
	{ name: 'Terracota Queimado', hex: '#c2410c' },
	{ name: 'Âmbar Dourado', hex: '#d97706' },
	{ name: 'Esmeralda Vibrante', hex: '#059669' },
	{ name: 'Verde Floresta', hex: '#16a34a' },
	{ name: 'Verde Oliva Vivo', hex: '#65a30d' },
	{ name: 'Verde Petróleo', hex: '#0d9488' },
	{ name: 'Ciano Oceano', hex: '#0284c7' },
	{ name: 'Azul Meia-Noite', hex: '#1e293b' },
	{ name: 'Grafite Editorial', hex: '#27272a' }
];
