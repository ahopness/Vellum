import { env } from '$env/dynamic/private';

export const DEFAULT_RESEND_FROM_EMAIL = 'Vellum <auth@vellum.lucasangelo.dev>';

/**
 * Obtém a chave do Resend buscando em todas as fontes possíveis:
 * - SvelteKit $env/dynamic/private (lê de .env em dev e do Cloudflare Pages em prod)
 * - platform.env (contexto de runtime do Cloudflare)
 * - process.env (variáveis de ambiente do sistema/Node)
 */
export function getResendApiKey(platform?: App.Platform): string | undefined {
	return (
		env.RESEND_API_KEY ||
		platform?.env?.RESEND_API_KEY ||
		(typeof process !== 'undefined' ? process.env?.RESEND_API_KEY : undefined)
	);
}

/**
 * Obtém o remetente configurado ou usa o domínio próprio (auth@vellum.lucasangelo.dev)
 */
export function getResendFromEmail(platform?: App.Platform): string {
	return (
		env.RESEND_FROM_EMAIL ||
		(platform?.env as any)?.RESEND_FROM_EMAIL ||
		(typeof process !== 'undefined' ? process.env?.RESEND_FROM_EMAIL : undefined) ||
		DEFAULT_RESEND_FROM_EMAIL
	);
}

/**
 * Disparo transacional de e-mails usando a API nativa do Resend via fetch.
 * Se nenhuma chave for encontrada, opera em modo desenvolvimento logando no terminal.
 */
export async function sendMagicLinkEmail(params: {
	to: string;
	url: string;
	adminName?: string;
	apiKey?: string;
	fromEmail?: string;
}): Promise<{ success: boolean; error?: string; devUrl?: string }> {
	const { to, url, adminName, apiKey, fromEmail = DEFAULT_RESEND_FROM_EMAIL } = params;

	// Se não houver chave do Resend configurada, roda no modo desenvolvimento
	if (!apiKey) {
		console.log('\n================ [VELLUM MAGIC LINK] ================');
		console.log(`Para: ${to} (${adminName || 'Organizador'})`);
		console.log(`Link de Acesso: ${url}`);
		console.log('Validade: 15 minutos (uso único)');
		console.log('Aviso: RESEND_API_KEY não foi detectada. Operando em modo de desenvolvimento.');
		console.log('=====================================================\n');
		return { success: true, devUrl: url };
	}

	try {
		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey.trim()}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: fromEmail,
				to: [to],
				subject: 'Seu link de acesso ao Vellum',
				html: `
					<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 40px 20px; color: #18181b;">
						<div style="border-bottom: 2px solid #18181b; padding-bottom: 12px; margin-bottom: 24px;">
							<h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: normal; margin: 0;">Vellum</h1>
						</div>
						<p style="font-size: 16px; line-height: 1.5; color: #18181b;">
							Olá, ${adminName || 'Organizador'}.
						</p>
						<p style="font-size: 16px; line-height: 1.5; color: #52525b;">
							Clique no botão abaixo para acessar o painel de gerenciamento de eventos do Vellum. Este link é de uso único e expira em 15 minutos.
						</p>
						<div style="margin: 32px 0;">
							<a href="${url}" style="background-color: #18181b; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 15px; font-weight: 500; display: inline-block;">
								Acessar Painel
							</a>
						</div>
						<p style="font-size: 13px; line-height: 1.4; color: #71717a; border-top: 1px solid #e4e4e7; padding-top: 20px; margin-top: 40px;">
							Se você não solicitou este acesso, desconsidere este e-mail.
						</p>
					</div>
				`
			})
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('Falha ao enviar e-mail via Resend:', errorData);
			return { success: false, error: `Erro do Resend: ${errorData}` };
		}

		return { success: true };
	} catch (err: any) {
		console.error('Erro de rede ao conectar com Resend:', err);
		return { success: false, error: err.message };
	}
}
