<script lang="ts">
	import { enhance } from '$app/forms';
	import FormField from '$lib/components/FormField.svelte';
	import CertificatePicker from '$lib/components/CertificatePicker.svelte';
	import { EDITORIAL_THEMES } from '$lib/utils/colors';
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
	let themeColor = $state('#2563eb'); // Azul Cobalto Vibrante padrão
	let certTemplateData = $state('');
	let logoPreview = $state<string | null>(null);
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

	function handleLogoChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (ev) => {
				logoPreview = ev.target?.result as string;
			};
			reader.readAsDataURL(file);
		} else {
			logoPreview = null;
		}
	}

	function removeLogo() {
		logoPreview = null;
		const input = document.getElementById('event-logo-input') as HTMLInputElement;
		if (input) input.value = '';
	}
</script>

<div class="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 space-y-12">
	<header class="space-y-3 border-b border-[#18181b] pb-6">
		<div class="flex items-center space-x-2">
			<a href="/admin" class="text-xs uppercase font-mono text-[#71717a] hover:text-[#18181b]">
				← Meus Eventos
			</a>
		</div>
		<div class="flex items-center space-x-3">
			<img src="/icons/icon_pen.png" alt="" class="w-6 h-6 object-contain" />
			<h1 class="font-serif text-3xl sm:text-4xl font-semibold text-[#18181b]">
				Cadastrar Novo Evento
			</h1>
		</div>
		<p class="font-sans text-sm text-[#71717a]">
			Configure os dados da atividade, logo institucional, paleta temática e ajuste as coordenadas do certificado.
		</p>
	</header>

	{#if form?.error}
		<div class="p-3 bg-red-50 border-l-2 border-red-600 text-xs text-red-800 font-sans">
			{form.error}
		</div>
	{/if}

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update();
			};
		}}
		class="space-y-12"
	>
		<!-- 1. Informações Básicas e Logo -->
		<section class="space-y-6">
			<div class="flex items-center space-x-2 border-b border-[#e4e4e7] pb-2">
				<img src="/icons/icon_desk.png" alt="" class="w-4 h-4 object-contain" />
				<h2 class="font-serif text-xl font-medium text-[#18181b]">
					1. Informações Gerais & Logo
				</h2>
			</div>

			<div class="space-y-5">
				<!-- Upload de Logo com R2 -->
				<div class="space-y-2 p-4 border border-[#e4e4e7] bg-white">
					<span class="block text-xs uppercase tracking-wider text-[#71717a] font-sans font-medium">
						Logo do Evento / Instituição (Salvo no R2)
					</span>

					<div class="flex flex-wrap items-center gap-4">
						{#if logoPreview}
							<div class="relative w-16 h-16 border border-[#d4d4d8] bg-[#fafafa] flex items-center justify-center p-1">
								<img src={logoPreview} alt="Prévia da Logo" class="max-w-full max-h-full object-contain" />
							</div>
						{/if}

						<label
							for="event-logo-input"
							class="cursor-pointer inline-flex items-center space-x-2 px-4 h-11 text-xs uppercase tracking-wider font-medium border border-[#18181b] bg-white text-[#18181b] hover:bg-[#18181b] hover:text-white transition-colors"
						>
							<img src="/icons/icon_file.png" alt="" class="w-3.5 h-3.5 object-contain" />
							<span>{logoPreview ? 'Trocar Imagem da Logo' : 'Adicionar Logo ao Evento'}</span>
						</label>

						<input
							id="event-logo-input"
							name="logo"
							type="file"
							accept="image/png,image/jpeg,image/svg+xml,image/webp"
							onchange={handleLogoChange}
							class="hidden"
						/>

						{#if logoPreview}
							<button
								type="button"
								onclick={removeLogo}
								class="text-xs uppercase tracking-wider text-red-600 hover:underline font-mono"
							>
								Remover
							</button>
						{/if}
					</div>
					<p class="text-[11px] text-[#a1a1aa] font-sans">
						PNG, SVG ou JPEG transparente. A logo será exibida no cabeçalho da página pública do participante e no painel.
					</p>
				</div>

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

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
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

		<!-- 2. Cor Temática Editorial Expandida & Vibrante -->
		<section class="space-y-6">
			<div class="flex items-center space-x-2 border-b border-[#e4e4e7] pb-2">
				<img src="/icons/icon_light_on.png" alt="" class="w-4 h-4 object-contain" />
				<h2 class="font-serif text-xl font-medium text-[#18181b]">
					2. Cor Temática do Evento
				</h2>
			</div>

			<p class="text-xs text-[#71717a] font-sans leading-relaxed">
				Selecione uma tonalidade da nossa paleta ampliada ou digite o código Hex. Esta cor conduzirá os botões, mira do certificado e linha de destaque da atividade.
			</p>

			<div class="space-y-4">
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
					{#each EDITORIAL_THEMES as theme}
						<button
							type="button"
							onclick={() => (themeColor = theme.hex)}
							class="flex items-center space-x-2 p-2 border text-[11px] font-mono transition-all text-left {themeColor.toLowerCase() === theme.hex.toLowerCase()
								? 'border-[#18181b] ring-2 ring-[#18181b] bg-white font-medium shadow-xs'
								: 'border-[#e4e4e7] bg-white text-[#52525b] hover:border-[#a1a1aa]'}"
						>
							<span class="w-3.5 h-3.5 shrink-0 rounded-xs" style="background-color: {theme.hex};"></span>
							<span class="truncate">{theme.name}</span>
						</button>
					{/each}
				</div>

				<div class="flex items-center space-x-3 pt-3">
					<span class="text-xs text-[#71717a] font-mono">Hexadecimal personalizado:</span>
					<input
						type="color"
						bind:value={themeColor}
						class="w-9 h-9 p-0 border border-[#d4d4d8] cursor-pointer"
					/>
					<input
						type="text"
						name="theme_color"
						bind:value={themeColor}
						class="w-28 h-9 px-2 border border-[#d4d4d8] font-mono text-xs uppercase"
					/>
					<div
						class="px-3 py-1 text-xs font-mono uppercase"
						style="background-color: {themeColor}; color: white;"
					>
						Prévia do Botão
					</div>
				</div>
			</div>
		</section>

		<!-- 3. Modelo do Certificado e Coordenadas -->
		<section class="space-y-6">
			<div class="flex items-center space-x-2 border-b border-[#e4e4e7] pb-2">
				<img src="/icons/icon_file.png" alt="" class="w-4 h-4 object-contain" />
				<h2 class="font-serif text-xl font-medium text-[#18181b]">
					3. Posicionamento do Certificado
				</h2>
			</div>

			<p class="text-xs text-[#71717a] font-sans">
				Você pode usar o template padrão ou carregar a arte gráfica da sua instituição. Clique na imagem para calibrar onde serão impressos o Nome, CPF e Data.
			</p>

			<CertificatePicker
				bind:config={certConfig}
				themeColor={themeColor}
				onchange={handleCertConfigChange}
			/>

			<!-- Inputs para envio de dados do certificado -->
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
				class="inline-flex items-center justify-center h-12 px-8 bg-[#18181b] text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors disabled:opacity-50 space-x-2"
			>
				{#if loading}
					<img src="/icons/icon_loading.gif" alt="" class="w-4 h-4" />
					<span>Publicando no R2...</span>
				{:else}
					<span>Publicar Evento</span>
				{/if}
			</button>
		</div>
	</form>
</div>
