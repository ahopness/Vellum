<script lang="ts">
	import {
		maskCpf,
		formatDateTime,
		formatTime,
		getAttendanceWindow
	} from '$lib/utils/formatters';
	import { getContrastTextColor } from '$lib/utils/colors';
	import { downloadCertificatePdf, type CertConfig } from '$lib/utils/certificate';
	import FormField from '$lib/components/FormField.svelte';

	let { data } = $props();

	let name = $state('');
	let email = $state('');
	let cpf = $state('');
	let submitting = $state(false);
	let submitted = $state(false);
	let alreadyCheckedIn = $state(false);
	let errorMessage = $state('');
	let downloadingCert = $state(false);

	const windowStatus = $derived(getAttendanceWindow(data.event.starts_at, data.event.ends_at));
	const contrastTextColor = $derived(getContrastTextColor(data.event.theme_color));

	function handleCpfInput(e: Event & { currentTarget: HTMLInputElement }) {
		cpf = maskCpf(e.currentTarget.value);
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';

		if (!name.trim()) {
			errorMessage = 'Por favor, informe seu nome completo.';
			return;
		}

		if (!email.trim() || !email.includes('@')) {
			errorMessage = 'Por favor, informe um endereço de e-mail válido.';
			return;
		}

		submitting = true;

		try {
			// Envia APENAS nome e e-mail para a API (LGPD: CPF NUNCA É TRANSMITIDO)
			const res = await fetch('/api/attendance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					eventId: data.event.id,
					name: name.trim(),
					email: email.trim()
				})
			});

			const result = await res.json();

			if (!res.ok) {
				errorMessage = result.error || 'Falha ao registrar presença.';
				submitting = false;
				return;
			}

			submitted = true;
			alreadyCheckedIn = result.alreadyCheckedIn;

			// Se o certificado já estiver liberado (fim do evento ou tolerância de encerramento), gera o PDF
			if (result.canDownloadCert) {
				await triggerCertDownload();
			}
		} catch (err: any) {
			console.error('Erro de conexão:', err);
			errorMessage = 'Erro de conexão com o servidor. Verifique sua internet.';
		} finally {
			submitting = false;
		}
	}

	async function triggerCertDownload() {
		try {
			downloadingCert = true;
			const certConfig: CertConfig = JSON.parse(data.event.cert_config);
			await downloadCertificatePdf({
				templateUrlOrData: data.event.cert_template_url || undefined,
				config: certConfig,
				participantName: name.trim(),
				participantCpf: cpf.trim() || undefined,
				eventTitle: data.event.title
			});
		} catch (err) {
			console.error('Falha ao gerar certificado no navegador:', err);
			alert('Ocorreu um problema ao montar o PDF no seu celular. Tente novamente.');
		} finally {
			downloadingCert = false;
		}
	}
</script>

<div
	class="w-full flex-1 flex flex-col"
	style="--event-theme: {data.event.theme_color};"
>
	<!-- Fita de Destaque Editorial Superior com a Cor Temática -->
	<div class="w-full h-1" style="background-color: var(--event-theme);"></div>

	<main class="max-w-xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 flex-1 flex flex-col justify-center space-y-10">
		<!-- Cabeçalho Editorial do Evento -->
		<header class="space-y-4">
			<div class="flex items-center space-x-2">
				<span class="text-xs uppercase tracking-widest font-mono text-[#71717a]">
					Credenciamento Acadêmico
				</span>
			</div>

			<h1 class="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#18181b] leading-tight">
				{data.event.title}
			</h1>

			{#if data.event.description}
				<p class="font-sans text-sm text-[#52525b] leading-relaxed">
					{data.event.description}
				</p>
			{/if}

			<div class="pt-2 border-t border-[#e4e4e7] flex flex-wrap items-center justify-between text-xs font-mono text-[#71717a] gap-2">
				<span>Horário: <strong>{formatTime(data.event.starts_at)}</strong> – <strong>{formatTime(data.event.ends_at)}</strong></span>
				<span>{formatDateTime(data.event.starts_at).split('às')[0]}</span>
			</div>
		</header>

		<!-- ESTADO 1: Antes do início (Fora da janela de tolerância) -->
		{#if windowStatus.isUpcoming && !submitted}
			<div class="space-y-6 py-8 border-y border-[#e4e4e7]">
				<div class="space-y-2">
					<span class="inline-block text-xs font-mono uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200">
						Credenciamento em Breve
					</span>
					<h2 class="font-serif text-2xl text-[#18181b]">
						O evento ainda não começou
					</h2>
					<p class="font-sans text-sm text-[#52525b] leading-relaxed">
						O registro de presença será aberto automaticamente às <strong class="text-[#18181b] font-mono">{formatTime(new Date(windowStatus.openTime).toISOString())}</strong> (15 minutos antes do início do evento).
					</p>
				</div>
				<p class="text-xs text-[#a1a1aa] font-sans">
					Mantenha esta página aberta ou escaneie o código novamente no horário informado.
				</p>
			</div>

		<!-- ESTADO 2: Após encerramento do credenciamento (+15 min do término) -->
		{:else if windowStatus.isEnded && !submitted}
			<div class="space-y-6 py-8 border-y border-[#e4e4e7]">
				<div class="space-y-2">
					<span class="inline-block text-xs font-mono uppercase tracking-wider text-neutral-700 bg-neutral-100 px-2 py-0.5 border border-neutral-300">
						Presenças Encerradas
					</span>
					<h2 class="font-serif text-2xl text-[#18181b]">
						Período de credenciamento finalizado
					</h2>
					<p class="font-sans text-sm text-[#52525b] leading-relaxed">
						O período regulamentar de registro de presença para este evento expirou às <strong class="text-[#18181b] font-mono">{formatTime(new Date(windowStatus.closeTime).toISOString())}</strong>.
					</p>
				</div>
				<p class="text-xs text-[#71717a] font-sans">
					Caso você tenha participado da atividade, solicite a validação manual diretamente ao organizador responsável.
				</p>
			</div>

		<!-- ESTADO 3: Confirmado com Sucesso -->
		{:else if submitted}
			<div class="space-y-8 py-8 border-y border-[#e4e4e7]">
				<div class="space-y-3">
					<span class="inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-300">
						✓ Presença Confirmada
					</span>
					<h2 class="font-serif text-2xl sm:text-3xl text-[#18181b]">
						{alreadyCheckedIn ? 'Presença já registrada anteriormente' : 'Presença registrada com sucesso'}
					</h2>
					<p class="font-sans text-sm text-[#52525b] leading-relaxed">
						Obrigado, <strong class="text-[#18181b]">{name}</strong>. Seu registro foi validado nominalmente na lista oficial deste evento.
					</p>
				</div>

				<!-- Certificado Liberado ou Aguardando Encerramento -->
				{#if windowStatus.canDownloadCert}
					<div class="space-y-4 pt-2">
						<p class="text-sm font-sans text-[#18181b]">
							O seu certificado de participação foi gerado diretamente no seu dispositivo:
						</p>

						<button
							type="button"
							onclick={triggerCertDownload}
							disabled={downloadingCert}
							class="w-full h-12 text-xs uppercase tracking-widest font-medium transition-opacity flex items-center justify-center space-x-2"
							style="background-color: var(--event-theme); color: {contrastTextColor};"
						>
							<span>{downloadingCert ? 'Montando PDF...' : 'Baixar Certificado (.PDF)'}</span>
						</button>
					</div>
				{:else}
					<div class="p-4 border-l-2 border-[#18181b] bg-white space-y-2">
						<span class="text-xs font-mono uppercase tracking-wider text-[#71717a]">
							Liberação do Certificado
						</span>
						<p class="text-xs sm:text-sm text-[#52525b] leading-relaxed">
							O download do seu certificado estará disponível a partir das <strong class="text-[#18181b] font-mono">{formatTime(new Date(windowStatus.certReleaseTime).toISOString())}</strong> (ao término da atividade). Retorne a esta página ao final da sessão para baixar seu documento.
						</p>
					</div>
				{/if}

				<div class="pt-2 text-[11px] text-[#a1a1aa] font-sans">
					Em conformidade com a LGPD: seu CPF não foi enviado aos nossos servidores.
				</div>
			</div>

		<!-- ESTADO 4: Formulário de Credenciamento Aberto (±15 min) -->
		{:else}
			{#if errorMessage}
				<div class="p-3 bg-red-50 border-l-2 border-red-600 text-xs text-red-800 font-sans">
					{errorMessage}
				</div>
			{/if}

			<form onsubmit={handleSubmit} class="space-y-6">
				<!-- Campo: Nome Completo -->
				<FormField
					label="Nome Completo"
					name="name"
					bind:value={name}
					placeholder="Como sairá no seu certificado"
					required
					autocomplete="name"
					autocapitalize="words"
				/>

				<!-- Campo: E-mail -->
				<FormField
					label="Endereço de E-mail"
					name="email"
					type="email"
					bind:value={email}
					placeholder="seu.email@exemplo.com"
					required
					autocomplete="email"
					inputmode="email"
				/>

				<!-- Campo: CPF com Máscara e Nota de Privacidade Obrigatória -->
				<div class="space-y-1.5 w-full">
					<label for="cpf" class="block text-xs uppercase tracking-wider text-[#71717a] font-sans font-medium">
						CPF (Apenas para o Certificado)
					</label>

					<input
						id="cpf"
						name="cpf"
						type="text"
						bind:value={cpf}
						oninput={handleCpfInput}
						placeholder="000.000.000-00"
						inputmode="numeric"
						pattern="[0-9.-]*"
						class="w-full h-12 bg-white px-3 border border-[#d4d4d8] rounded-none font-sans text-base text-[#18181b] placeholder:text-[#a1a1aa] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--event-theme)] focus:border-[var(--event-theme)]"
					/>

					<!-- Nota de Privacidade LGPD Visível (Design Bible 6.3) -->
					<p class="text-[11px] text-[#71717a] font-sans leading-relaxed pt-0.5">
						Seu CPF é processado localmente apenas para gerar seu certificado e nunca é salvo em nossos servidores.
					</p>
				</div>

				<!-- Botão Primário CTA com Altura de 48px e Cor Temática Calculada -->
				<div class="pt-4">
					<button
						type="submit"
						disabled={submitting}
						class="w-full h-12 text-xs uppercase tracking-widest font-medium transition-opacity flex items-center justify-center space-x-2 disabled:opacity-50"
						style="background-color: var(--event-theme); color: {contrastTextColor};"
					>
						<span>{submitting ? 'Registrando Presença...' : 'Confirmar Presença & Emitir'}</span>
					</button>
				</div>
			</form>
		{/if}
	</main>
</div>
