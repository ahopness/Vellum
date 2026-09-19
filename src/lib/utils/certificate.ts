import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface FieldConfig {
	x: number; // Coordenada X na imagem/canvas (a partir da esquerda)
	y: number; // Coordenada Y na imagem/canvas (a partir do topo)
	font_size: number;
	font_family?: string;
	color?: string; // Hex (ex: #111827)
	align?: 'left' | 'center' | 'right';
}

export interface CertConfig {
	name_field: FieldConfig;
	cpf_field?: FieldConfig;
	date_field?: FieldConfig;
	organizer_name_field?: FieldConfig;
	organizer_cpf_field?: FieldConfig;
	reference_width?: number; // Largura de referência do template (ex: 1200)
	reference_height?: number; // Altura de referência do template (ex: 800)
}

/**
 * Converte cor hex (#111827) em valores normalizados RGB (0 a 1) para o pdf-lib
 */
function hexToPdfRgb(hexColor?: string) {
	if (!hexColor) return rgb(0.1, 0.1, 0.1);
	let hex = hexColor.replace('#', '').trim();
	if (hex.length === 3) {
		hex = hex
			.split('')
			.map((c) => c + c)
			.join('');
	}
	if (hex.length !== 6) return rgb(0.1, 0.1, 0.1);

	const r = parseInt(hex.substring(0, 2), 16) / 255;
	const g = parseInt(hex.substring(2, 4), 16) / 255;
	const b = parseInt(hex.substring(4, 6), 16) / 255;
	return rgb(r, g, b);
}

/**
 * Converte base64 ou data-url para Uint8Array
 */
function dataUrlToBytes(dataUrl: string): Uint8Array {
	const base64 = dataUrl.split(',')[1] || dataUrl;
	const binaryString = atob(base64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

/**
 * Gera um certificado elegante editorial em PDF em memória usando pdf-lib
 */
export async function generateCertificatePdf(params: {
	templateUrlOrData?: string;
	config: CertConfig;
	participantName: string;
	participantCpf?: string;
	organizerName?: string;
	organizerCpf?: string;
	eventTitle: string;
	issueDate?: string;
}): Promise<Uint8Array> {
	const {
		templateUrlOrData,
		config,
		participantName,
		participantCpf,
		organizerName,
		organizerCpf,
		eventTitle,
		issueDate = new Date().toLocaleDateString('pt-BR')
	} = params;

	let pdfDoc: PDFDocument;
	let page: any;
	let pageWidth: number;
	let pageHeight: number;

	// Carrega fontes padrão
	const titleFont = await (async () => {
		const tempDoc = await PDFDocument.create();
		return tempDoc.embedFont(StandardFonts.TimesRomanBold);
	})();

	if (templateUrlOrData) {
		try {
			let templateBytes: Uint8Array;
			if (templateUrlOrData.startsWith('data:')) {
				templateBytes = dataUrlToBytes(templateUrlOrData);
			} else {
				const res = await fetch(templateUrlOrData);
				const buffer = await res.arrayBuffer();
				templateBytes = new Uint8Array(buffer);
			}

			// Tenta carregar como PDF primeiro
			if (templateUrlOrData.endsWith('.pdf') || (templateBytes[0] === 0x25 && templateBytes[1] === 0x50)) {
				pdfDoc = await PDFDocument.load(templateBytes);
				page = pdfDoc.getPages()[0];
				const size = page.getSize();
				pageWidth = size.width;
				pageHeight = size.height;
			} else {
				// Carrega como imagem (PNG ou JPEG)
				pdfDoc = await PDFDocument.create();
				let image: any;
				try {
					image = await pdfDoc.embedPng(templateBytes);
				} catch {
					image = await pdfDoc.embedJpg(templateBytes);
				}
				pageWidth = image.width;
				pageHeight = image.height;
				page = pdfDoc.addPage([pageWidth, pageHeight]);
				page.drawImage(image, {
					x: 0,
					y: 0,
					width: pageWidth,
					height: pageHeight
				});
			}
		} catch (err) {
			console.warn('Falha ao carregar template, gerando certificado editorial padrão:', err);
			pdfDoc = await PDFDocument.create();
			pageWidth = 1200;
			pageHeight = 840;
			page = pdfDoc.addPage([pageWidth, pageHeight]);
			drawEditorialTemplate(page, pageWidth, pageHeight, eventTitle);
		}
	} else {
		// Template editorial padrão puro pdf-lib
		pdfDoc = await PDFDocument.create();
		pageWidth = 1200;
		pageHeight = 840;
		page = pdfDoc.addPage([pageWidth, pageHeight]);
		drawEditorialTemplate(page, pageWidth, pageHeight, eventTitle);
	}

	// Fontes para os campos preenchidos
	const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
	const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

	// Fator de escala se as coordenadas foram salvas com base numa largura de referência diferente
	const refWidth = config.reference_width || pageWidth;
	const refHeight = config.reference_height || pageHeight;
	const scaleX = pageWidth / refWidth;
	const scaleY = pageHeight / refHeight;

	// Função auxiliar para desenhar campo com alinhamento
	const drawTextField = (
		text: string,
		field: FieldConfig,
		font: any
	) => {
		const fontSize = field.font_size * scaleY;
		const textWidth = font.widthOfTextAtSize(text, fontSize);
		const targetX = field.x * scaleX;
		const targetY = field.y * scaleY;

		// Converte Y (que vem do topo da tela) para a coordenada PDF (que vem da base da página)
		const pdfY = pageHeight - targetY;

		let pdfX = targetX;
		if (field.align === 'center') {
			pdfX = targetX - textWidth / 2;
		} else if (field.align === 'right') {
			pdfX = targetX - textWidth;
		}

		page.drawText(text, {
			x: pdfX,
			y: pdfY,
			size: fontSize,
			font,
			color: hexToPdfRgb(field.color)
		});
	};

	// 1. Nome do Participante
	if (config.name_field && participantName) {
		drawTextField(participantName, config.name_field, fontBold);
	}

	// 2. CPF do Participante
	if (config.cpf_field && participantCpf) {
		const cpfLabel = participantCpf.startsWith('CPF') ? participantCpf : `CPF: ${participantCpf}`;
		drawTextField(cpfLabel, config.cpf_field, fontRegular);
	}

	// 3. Data de Emissão
	if (config.date_field && issueDate) {
		drawTextField(issueDate, config.date_field, fontRegular);
	}

	// 4. Nome do Organizador
	if (config.organizer_name_field && organizerName) {
		drawTextField(organizerName, config.organizer_name_field, fontBold);
	}

	// 5. CPF do Organizador
	if (config.organizer_cpf_field && organizerCpf) {
		const cpfLabel = organizerCpf.startsWith('CPF') ? organizerCpf : `CPF: ${organizerCpf}`;
		drawTextField(cpfLabel, config.organizer_cpf_field, fontRegular);
	}

	return await pdfDoc.save();
}

/**
 * Desenha um layout de certificado editorial clássico se nenhum template de imagem for fornecido
 */
function drawEditorialTemplate(page: any, width: number, height: number, eventTitle: string) {
	// Fundo off-white
	page.drawRectangle({
		x: 0,
		y: 0,
		width,
		height,
		color: rgb(0.98, 0.98, 0.98)
	});

	// Borda dupla editorial ultrafina
	page.drawRectangle({
		x: 40,
		y: 40,
		width: width - 80,
		height: height - 80,
		borderColor: rgb(0.2, 0.2, 0.2),
		borderWidth: 1.5
	});

	page.drawRectangle({
		x: 46,
		y: 46,
		width: width - 92,
		height: height - 92,
		borderColor: rgb(0.7, 0.7, 0.7),
		borderWidth: 0.5
	});
}

/**
 * Gera e dispara o download imediato do arquivo PDF no navegador
 */
export async function downloadCertificatePdf(params: {
	templateUrlOrData?: string;
	config: CertConfig;
	participantName: string;
	participantCpf?: string;
	organizerName?: string;
	organizerCpf?: string;
	eventTitle: string;
	issueDate?: string;
}) {
	const pdfBytes = await generateCertificatePdf(params);
	const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
	const url = URL.createObjectURL(blob);

	const cleanTitle = params.eventTitle.replace(/[^a-zA-Z0-9À-ÿ]/g, '_');
	const cleanName = params.participantName.replace(/[^a-zA-Z0-9À-ÿ]/g, '_');
	const filename = `Certificado_${cleanName}_${cleanTitle}.pdf`;

	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
