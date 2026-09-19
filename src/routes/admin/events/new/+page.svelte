<script lang="ts">
	import { enhance } from '$app/forms';
	import FormField from '$lib/components/FormField.svelte';
	import CertificatePicker from '$lib/components/CertificatePicker.svelte';
	import { EDITORIAL_THEMES, getContrastTextColor } from '$lib/utils/colors';
	import type { CertConfig } from '$lib/utils/certificate';

	let { form } = $props();

	// Datas padrão: Início agora (arredondado para a hora), Término em 3 horas
	const now = new Date();
	now.setMinutes(0, 0, 0);
	const startIsoDefault = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
		.toISOString()
		.slice(0, 16);

	const endDefault = new Date(now.getTime() + 3 * 60 * 60 * 1000);
	const endIsoDefault = new Date(endDefault.getTime() - endDefault.getTimezoneOffset() * 60000)
		.toISOString()
		.slice(0, 16);

	let title = $state('');
	let description = $state('');
	let startsAt = $state(startIsoDefault);
	let endsAt = $state(endIsoDefault);
	let themeColor = $state('#3f3f46');
	let certTemplateData = $state('');
	let loading = $state(false);

	let certConfig = $state<CertConfig>({
		name_field: { x: 600, y: 440, font_size: 32, align: 'center', color: '#18181b' },
		cpf_field: { x: 600, y: 500, font_size: 16, align: 'center', color: '#52525b' },
		date_field: { x: 950, y: 700, font_size: 14, align: 'right', color: '#71717a' },
		reference_width: 1200,
		reference_height: 800
	});

	function handleCertConfigChange(newConfig: CertConfig, templateDataUrl?: string) {
		certConfig = newConfig;
		if (templateDataUrl) {
			certTemplateData = templateDataUrl;
		}
	}
</script>

<div class="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 space-y-12">
	<header class="space-y-3 border-b border-[#18181b] pb-6">
		<div class="flex items-center space-x-2">
			<a href="/admin" class="text-xs uppercase font-mono text-[#71717a] hover:text-[#18181b]">
				← Meus Eventos
			</a>
		</div>
		<h1 class="font-serif text-3xl sm:text-4xl font-semibold text-[#18181b]">
			Cadastrar Novo Evento
		</h1>
		<p class="font-sans text-sm text-[#71717a]">
			Configure os dados da atividade, defina a identidade temática e ajuste as coordenadas do certificado.
		</p>
	</header>

	{#if form?.error}
		<div class="p-3 bg-red-50 border-l-2 border-red-600 text-xs text-red-800 font-sans">
			{form.error}
		</div>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update();
			};
		}}
		class="space-y-12"
	>
		<!-- 1. Informações Básicas -->
		<section class="space-y-6">
			<h2 class="font-serif text-xl font-medium text-[#18181b] border-b border-[#e4e4e7] pb-2">
				1. Informações Gerais
			</h2>

			<div class="space-y-4">
				<FormField
					label="Título do Evento ou Aula"
					name="title"
					bind:value={title}
					placeholder="ex: Simpósio de Literatura Contemporânea"
					required
				/>

				<FormField
					label="Descrição Breve / Local (Opcional)"
					name="description"
					bind:value={description}
					placeholder="ex: Auditório Principal, Bloco B - 4 horas de carga horária"
				/>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<FormField
						label="Início do Evento"
						name="starts_at"
						type="datetime-local"
						bind:value={startsAt}
						required
						helperText="Credenciamento abre 15 minutos antes."
					/>

					<FormField
						label="Término Previsto"
						name="ends_at"
						type="datetime-local"
						bind:value={endsAt}
						required
						helperText="Download do certificado liberado nos 15 min finais."
					/>
				</div>
			</div>
		</section>

		<!-- 2. Cor Temática Editorial -->
		<section class="space-y-6">
			<h2 class="font-serif text-xl font-medium text-[#18181b] border-b border-[#e4e4e7] pb-2">
				2. Cor Temática do Evento
			</h2>

			<p class="text-xs text-[#71717a] font-sans">
				Esta cor personalizará a fita de destaque editorial, os botões e os focos de formulário na tela do participante.
			</p>

			<div class="space-y-4">
				<div class="flex flex-wrap gap-3">
					{#each EDITORIAL_THEMES as theme}
						<button
							type="button"
							onclick={() => (themeColor = theme.hex)}
							class="flex items-center space-x-2 px-3 py-2 border text-xs font-mono transition-all {themeColor === theme.hex
								? 'border-[#18181b] ring-1 ring-[#18181b] bg-white font-medium'
								: 'border-[#e4e4e7] bg-white text-[#71717a] hover:border-[#a1a1aa]'}"
						>
							<span class="w-3.5 h-3.5 inline-block" style="background-color: {theme.hex};"></span>
							<span>{theme.name}</span>
						</button>
					{/each}
				</div>

				<div class="flex items-center space-x-3 pt-2">
					<span class="text-xs text-[#71717a] font-mono">Hex personalizado:</span>
					<input
						type="color"
						bind:value={themeColor}
						class="w-8 h-8 p-0 border border-[#d4d4d8] cursor-pointer"
					/>
					<input
						type="text"
						name="theme_color"
						bind:value={themeColor}
						class="w-28 h-9 px-2 border border-[#d4d4d8] font-mono text-xs uppercase"
					/>
				</div>
			</div>
		</section>

		<!-- 3. Modelo do Certificado e Coordenadas -->
		<section class="space-y-6">
			<h2 class="font-serif text-xl font-medium text-[#18181b] border-b border-[#e4e4e7] pb-2">
				3. Posicionamento do Certificado
			</h2>

			<p class="text-xs text-[#71717a] font-sans">
				Você pode usar o template padrão ou carregar o design gráfico da sua instituição. Clique na área do certificado para calibrar as posições do Nome, CPF e Data.
			</p>

			<CertificatePicker
				bind:config={certConfig}
				themeColor={themeColor}
				onchange={handleCertConfigChange}
			/>

			<!-- Inputs ocultos para envio de dados do certificado -->
			<input type="hidden" name="cert_template_url" value={certTemplateData} />
			<input type="hidden" name="cert_config" value={JSON.stringify(certConfig)} />
		</section>

		<div class="pt-6 border-t border-[#18181b] flex items-center justify-between">
			<a
				href="/admin"
				class="text-xs uppercase tracking-wider font-mono text-[#71717a] hover:text-[#18181b]"
			>
				Cancelar
			</a>

			<button
				type="submit"
				disabled={loading}
				class="inline-flex items-center justify-center h-12 px-8 bg-[#18181b] text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors disabled:opacity-50"
			>
				<span>{loading ? 'Publicando...' : 'Publicar Evento'}</span>
			</button>
		</div>
	</form>
</div>
