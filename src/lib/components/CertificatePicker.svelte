<script lang="ts">
	import type { CertConfig, FieldConfig } from '$lib/utils/certificate';

	interface Props {
		config: CertConfig;
		templateUrl?: string;
		themeColor?: string;
		onchange?: (config: CertConfig, templateDataUrl?: string) => void;
	}

	let {
		config = $bindable(),
		templateUrl = '',
		themeColor = '#3f3f46',
		onchange
	}: Props = $props();

	type ActiveField = 'name' | 'cpf' | 'date' | 'organizer_name' | 'organizer_cpf';
	let activeField = $state<ActiveField>('name');

	let imageElement: HTMLElement | null = $state(null);
	let containerElement: HTMLDivElement | null = $state(null);
	let naturalWidth = $state(1200);
	let naturalHeight = $state(800);
	let userTemplateUrl = $state<string | null>(null);
	const currentTemplateUrl = $derived(userTemplateUrl ?? templateUrl ?? '');

	const currentConfig = $derived(
		activeField === 'name'
			? config.name_field
			: activeField === 'cpf'
			? config.cpf_field
			: activeField === 'date'
			? config.date_field
			: activeField === 'organizer_name'
			? config.organizer_name_field
			: config.organizer_cpf_field
	);

	// Garante que os campos existam com valores padrão
	if (!config.name_field) {
		config.name_field = { x: 600, y: 440, font_size: 32, align: 'center', color: '#18181b' };
	}
	if (!config.cpf_field) {
		config.cpf_field = { x: 600, y: 500, font_size: 16, align: 'center', color: '#52525b' };
	}
	if (!config.date_field) {
		config.date_field = { x: 950, y: 700, font_size: 14, align: 'right', color: '#71717a' };
	}
	if (!config.organizer_name_field) {
		config.organizer_name_field = { x: 300, y: 680, font_size: 16, align: 'center', color: '#18181b' };
	}
	if (!config.organizer_cpf_field) {
		config.organizer_cpf_field = { x: 300, y: 710, font_size: 12, align: 'center', color: '#52525b' };
	}

	function handleImageLoad(e: Event) {
		const img = e.currentTarget as HTMLImageElement;
		naturalWidth = img.naturalWidth || 1200;
		naturalHeight = img.naturalHeight || 800;
		config.reference_width = naturalWidth;
		config.reference_height = naturalHeight;
		notifyChange();
	}

	function handleImageClick(e: MouseEvent) {
		if (!imageElement) return;
		const rect = imageElement.getBoundingClientRect();
		const clientX = e.clientX - rect.left;
		const clientY = e.clientY - rect.top;

		// Converte coordenadas da tela para a resolução natural da imagem
		const scaleX = naturalWidth / rect.width;
		const scaleY = naturalHeight / rect.height;

		const naturalX = Math.round(clientX * scaleX);
		const naturalY = Math.round(clientY * scaleY);

		if (activeField === 'name') {
			config.name_field.x = naturalX;
			config.name_field.y = naturalY;
		} else if (activeField === 'cpf') {
			if (!config.cpf_field) {
				config.cpf_field = { x: naturalX, y: naturalY, font_size: 16, align: 'center', color: '#52525b' };
			} else {
				config.cpf_field.x = naturalX;
				config.cpf_field.y = naturalY;
			}
		} else if (activeField === 'date') {
			if (!config.date_field) {
				config.date_field = { x: naturalX, y: naturalY, font_size: 14, align: 'right', color: '#71717a' };
			} else {
				config.date_field.x = naturalX;
				config.date_field.y = naturalY;
			}
		} else if (activeField === 'organizer_name') {
			if (!config.organizer_name_field) {
				config.organizer_name_field = { x: naturalX, y: naturalY, font_size: 16, align: 'center', color: '#18181b' };
			} else {
				config.organizer_name_field.x = naturalX;
				config.organizer_name_field.y = naturalY;
			}
		} else if (activeField === 'organizer_cpf') {
			if (!config.organizer_cpf_field) {
				config.organizer_cpf_field = { x: naturalX, y: naturalY, font_size: 12, align: 'center', color: '#52525b' };
			} else {
				config.organizer_cpf_field.x = naturalX;
				config.organizer_cpf_field.y = naturalY;
			}
		}

		notifyChange();
	}

	function handleFileUpload(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (uploadEvent) => {
			const dataUrl = uploadEvent.target?.result as string;
			userTemplateUrl = dataUrl;
			notifyChange(dataUrl);
		};
		reader.readAsDataURL(file);
	}

	function notifyChange(dataUrl?: string) {
		if (onchange) {
			onchange(config, dataUrl || currentTemplateUrl);
		}
	}

	// Converte coordenadas naturais para porcentagem relativa para posicionar o marcador na tela
	function getPercentPos(field: FieldConfig | undefined) {
		if (!field) return { left: '50%', top: '50%' };
		const left = (field.x / naturalWidth) * 100;
		const top = (field.y / naturalHeight) * 100;
		return { left: `${left}%`, top: `${top}%` };
	}
</script>

<div class="space-y-4">
	<!-- Barra de seleção do campo ativo e upload -->
	<div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e4e4e7]">
		<div class="flex items-center space-x-2">
			<span class="text-xs uppercase tracking-wider text-[#71717a] font-sans mr-2">Posicionar:</span>
			
			<button
				type="button"
				onclick={() => (activeField = 'name')}
				class="px-3 h-9 text-xs font-medium uppercase tracking-wider border transition-colors {activeField === 'name'
					? 'bg-[#18181b] text-white border-[#18181b]'
					: 'bg-white text-[#71717a] border-[#d4d4d8] hover:border-[#18181b]'}"
			>
				Nome do Aluno
			</button>

			<button
				type="button"
				onclick={() => (activeField = 'cpf')}
				class="px-3 h-9 text-xs font-medium uppercase tracking-wider border transition-colors {activeField === 'cpf'
					? 'bg-[#18181b] text-white border-[#18181b]'
					: 'bg-white text-[#71717a] border-[#d4d4d8] hover:border-[#18181b]'}"
			>
				CPF do Aluno
			</button>

			<button
				type="button"
				onclick={() => (activeField = 'date')}
				class="px-3 h-9 text-xs font-medium uppercase tracking-wider border transition-colors {activeField === 'date'
					? 'bg-[#18181b] text-white border-[#18181b]'
					: 'bg-white text-[#71717a] border-[#d4d4d8] hover:border-[#18181b]'}"
			>
				Data
			</button>

			<button
				type="button"
				onclick={() => (activeField = 'organizer_name')}
				class="px-3 h-9 text-xs font-medium uppercase tracking-wider border transition-colors {activeField === 'organizer_name'
					? 'bg-[#18181b] text-white border-[#18181b]'
					: 'bg-white text-[#71717a] border-[#d4d4d8] hover:border-[#18181b]'}"
			>
				Nome Organizador
			</button>

			<button
				type="button"
				onclick={() => (activeField = 'organizer_cpf')}
				class="px-3 h-9 text-xs font-medium uppercase tracking-wider border transition-colors {activeField === 'organizer_cpf'
					? 'bg-[#18181b] text-white border-[#18181b]'
					: 'bg-white text-[#71717a] border-[#d4d4d8] hover:border-[#18181b]'}"
			>
				CPF Organizador
			</button>
		</div>

		<div>
			<label class="cursor-pointer inline-flex items-center px-3 h-9 text-xs uppercase tracking-wider font-medium border border-[#d4d4d8] bg-white text-[#18181b] hover:border-[#18181b] transition-colors">
				<span>Carregar Imagem de Template (PNG/JPG)</span>
				<input
					type="file"
					accept="image/png,image/jpeg,image/webp"
					class="hidden"
					onchange={handleFileUpload}
				/>
			</label>
		</div>
	</div>

	<!-- Canvas / Imagem interativa do Certificado -->
	<div
		bind:this={containerElement}
		class="relative w-full border border-[#d4d4d8] bg-[#f4f4f5] select-none overflow-hidden"
	>
		<!-- Instrução flutuante sutil -->
		<div class="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 text-xs text-[#71717a] border border-[#e4e4e7] pointer-events-none font-sans">
			Clique na imagem para posicionar: <strong class="text-[#18181b] font-medium uppercase">
				{activeField === 'name'
					? 'Nome do Aluno'
					: activeField === 'cpf'
					? 'CPF do Aluno'
					: activeField === 'date'
					? 'Data'
					: activeField === 'organizer_name'
					? 'Nome do Organizador'
					: 'CPF do Organizador'}
			</strong>
		</div>

		<!-- Imagem de fundo ou Mockup Editorial -->
		{#if currentTemplateUrl}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img
				bind:this={imageElement}
				src={currentTemplateUrl}
				alt="Template do Certificado"
				onload={handleImageLoad}
				onclick={handleImageClick}
				class="w-full h-auto block cursor-crosshair"
			/>
		{:else}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				onclick={handleImageClick}
				bind:this={imageElement}
				class="w-full aspect-[1200/800] bg-[#ffffff] border-8 border-[#fafafa] flex flex-col items-center justify-center p-12 cursor-crosshair text-center"
			>
				<div class="w-full h-full border border-[#18181b] p-8 flex flex-col items-center justify-between">
					<div class="space-y-2 mt-4">
						<span class="text-xs uppercase tracking-widest text-[#71717a] font-mono">Certificado de Participação</span>
						<h3 class="font-serif text-3xl font-semibold text-[#18181b]">Vellum Editorial</h3>
					</div>
					<p class="text-xs text-[#a1a1aa] font-sans max-w-md">
						(Template padrão ativo. Para usar o seu próprio design gráfico, faça upload de uma imagem acima ou clique para definir as posições dos textos)
					</p>
					<div class="h-6"></div>
				</div>
			</div>
		{/if}

		<!-- Marcadores com Retículo (Crosshair) das posições -->
		<!-- 1. Marcador Nome -->
		{#if config.name_field}
			{@const pos = getPercentPos(config.name_field)}
			<div
				class="absolute pointer-events-none flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
				style="left: {pos.left}; top: {pos.top};"
			>
				<div
					class="w-4 h-4 border border-dashed rounded-full flex items-center justify-center"
					style="border-color: {activeField === 'name' ? themeColor : '#71717a'};"
				>
					<div class="w-1.5 h-1.5 rounded-full" style="background-color: {activeField === 'name' ? themeColor : '#71717a'};"></div>
				</div>
				<span
					class="text-[11px] font-serif font-medium whitespace-nowrap px-1.5 py-0.5 mt-0.5 bg-white/95 border border-[#e4e4e7] shadow-xs"
					style="color: {config.name_field.color || '#18181b'}; font-size: {Math.max(11, config.name_field.font_size * 0.45)}px;"
				>
					[ Nome do Aluno ]
				</span>
			</div>
		{/if}

		<!-- 2. Marcador CPF -->
		{#if config.cpf_field}
			{@const pos = getPercentPos(config.cpf_field)}
			<div
				class="absolute pointer-events-none flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
				style="left: {pos.left}; top: {pos.top};"
			>
				<div
					class="w-3.5 h-3.5 border border-dashed rounded-full flex items-center justify-center"
					style="border-color: {activeField === 'cpf' ? themeColor : '#71717a'};"
				>
					<div class="w-1.5 h-1.5 rounded-full" style="background-color: {activeField === 'cpf' ? themeColor : '#71717a'};"></div>
				</div>
				<span
					class="text-[10px] font-sans whitespace-nowrap px-1.5 py-0.5 mt-0.5 bg-white/95 border border-[#e4e4e7] shadow-xs"
					style="color: {config.cpf_field.color || '#52525b'}; font-size: {Math.max(9, config.cpf_field.font_size * 0.45)}px;"
				>
					[ CPF: 000.000.000-00 ]
				</span>
			</div>
		{/if}

		<!-- 3. Marcador Data -->
		{#if config.date_field}
			{@const pos = getPercentPos(config.date_field)}
			<div
				class="absolute pointer-events-none flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
				style="left: {pos.left}; top: {pos.top};"
			>
				<div
					class="w-3 h-3 border border-dashed rounded-full flex items-center justify-center"
					style="border-color: {activeField === 'date' ? themeColor : '#71717a'};"
				>
					<div class="w-1 h-1 rounded-full" style="background-color: {activeField === 'date' ? themeColor : '#71717a'};"></div>
				</div>
				<span
					class="text-[10px] font-sans whitespace-nowrap px-1 py-0.5 mt-0.5 bg-white/95 border border-[#e4e4e7] shadow-xs"
					style="color: {config.date_field.color || '#71717a'};"
				>
					[ 19/09/2026 ]
				</span>
			</div>
		{/if}

		<!-- 4. Marcador Nome do Organizador -->
		{#if config.organizer_name_field}
			{@const pos = getPercentPos(config.organizer_name_field)}
			<div
				class="absolute pointer-events-none flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
				style="left: {pos.left}; top: {pos.top};"
			>
				<div
					class="w-3.5 h-3.5 border border-dashed rounded-full flex items-center justify-center"
					style="border-color: {activeField === 'organizer_name' ? themeColor : '#71717a'};"
				>
					<div class="w-1.5 h-1.5 rounded-full" style="background-color: {activeField === 'organizer_name' ? themeColor : '#71717a'};"></div>
				</div>
				<span
					class="text-[10px] font-serif font-medium whitespace-nowrap px-1.5 py-0.5 mt-0.5 bg-white/95 border border-[#e4e4e7] shadow-xs"
					style="color: {config.organizer_name_field.color || '#18181b'}; font-size: {Math.max(10, config.organizer_name_field.font_size * 0.45)}px;"
				>
					[ Nome do Organizador ]
				</span>
			</div>
		{/if}

		<!-- 5. Marcador CPF do Organizador -->
		{#if config.organizer_cpf_field}
			{@const pos = getPercentPos(config.organizer_cpf_field)}
			<div
				class="absolute pointer-events-none flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
				style="left: {pos.left}; top: {pos.top};"
			>
				<div
					class="w-3 h-3 border border-dashed rounded-full flex items-center justify-center"
					style="border-color: {activeField === 'organizer_cpf' ? themeColor : '#71717a'};"
				>
					<div class="w-1 h-1 rounded-full" style="background-color: {activeField === 'organizer_cpf' ? themeColor : '#71717a'};"></div>
				</div>
				<span
					class="text-[9px] font-sans whitespace-nowrap px-1 py-0.5 mt-0.5 bg-white/95 border border-[#e4e4e7] shadow-xs"
					style="color: {config.organizer_cpf_field.color || '#52525b'}; font-size: {Math.max(9, config.organizer_cpf_field.font_size * 0.45)}px;"
				>
					[ CPF Organizador ]
				</span>
			</div>
		{/if}
	</div>

	<!-- Controles simplificados de ajuste fino para o campo selecionado -->
	{#if currentConfig}
		<div class="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 border border-[#e4e4e7] bg-white">
			<!-- Coordenadas X, Y -->
			<div class="space-y-1">
				<span class="block text-[11px] uppercase tracking-wider text-[#71717a] font-sans font-medium">
					Posição X, Y (px)
				</span>
				<div class="flex items-center space-x-2 font-mono text-sm">
					<input
						type="number"
						bind:value={currentConfig.x}
						oninput={() => notifyChange()}
						class="w-20 h-9 px-2 border border-[#d4d4d8] text-sm"
					/>
					<span class="text-[#a1a1aa]">×</span>
					<input
						type="number"
						bind:value={currentConfig.y}
						oninput={() => notifyChange()}
						class="w-20 h-9 px-2 border border-[#d4d4d8] text-sm"
					/>
				</div>
			</div>

			<!-- Tamanho da Fonte -->
			<div class="space-y-1">
				<div class="flex justify-between text-[11px] uppercase tracking-wider text-[#71717a] font-sans font-medium">
					<span>Tamanho da Fonte</span>
					<span class="font-mono">{currentConfig.font_size}px</span>
				</div>
				<input
					type="range"
					min="10"
					max="72"
					bind:value={currentConfig.font_size}
					oninput={() => notifyChange()}
					class="w-full accent-[var(--event-theme,#18181b)] h-9 cursor-pointer"
				/>
			</div>

			<!-- Alinhamento -->
			<div class="space-y-1">
				<span class="block text-[11px] uppercase tracking-wider text-[#71717a] font-sans font-medium">
					Alinhamento
				</span>
				<div class="flex items-center space-x-1">
					{#each ['left', 'center', 'right'] as align}
						<button
							type="button"
							onclick={() => {
								currentConfig.align = align as any;
								notifyChange();
							}}
							class="flex-1 h-9 text-xs uppercase font-mono border transition-colors {currentConfig.align === align
								? 'bg-[#18181b] text-white border-[#18181b]'
								: 'bg-white text-[#71717a] border-[#d4d4d8] hover:border-[#18181b]'}"
						>
							{align === 'left' ? 'Esq' : align === 'center' ? 'Centro' : 'Dir'}
						</button>
					{/each}
				</div>
			</div>

			<!-- Cor do Texto -->
			<div class="space-y-1">
				<span class="block text-[11px] uppercase tracking-wider text-[#71717a] font-sans font-medium">
					Cor do Texto
				</span>
				<div class="flex items-center space-x-2">
					<input
						type="color"
						bind:value={currentConfig.color}
						oninput={() => notifyChange()}
						class="w-9 h-9 p-0 border border-[#d4d4d8] cursor-pointer bg-white"
					/>
					<input
						type="text"
						bind:value={currentConfig.color}
						oninput={() => notifyChange()}
						class="w-24 h-9 px-2 border border-[#d4d4d8] font-mono text-xs uppercase"
					/>
				</div>
			</div>
		</div>
	{/if}
</div>
