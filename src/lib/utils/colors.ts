/**
 * Calcula a luminância relativa de uma cor Hexadecimal e determina
 * se o texto em cima dela deve ser claro (#ffffff) ou escuro (#18181b).
 */
export function getContrastTextColor(hexColor: string): '#ffffff' | '#18181b' {
	// Normaliza formato hex (#fff -> #ffffff)
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

	// Se luminância > 0.4, fundo é claro, use texto escuro; senão, fundo escuro, use texto branco
	return lum > 0.4 ? '#18181b' : '#ffffff';
}

/**
 * Paleta editorial de sugestões de cores temáticas com sobriedade
 */
export const EDITORIAL_THEMES = [
	{ name: 'Grafite Editorial', hex: '#3f3f46' },
	{ name: 'Azul Real', hex: '#1e3a8a' },
	{ name: 'Verde Esmeralda', hex: '#065f46' },
	{ name: 'Borgonha', hex: '#831843' },
	{ name: 'Terracota', hex: '#9a3412' },
	{ name: 'Índigo Profundo', hex: '#312e81' },
	{ name: 'Âmbar Nobre', hex: '#78350f' }
];
