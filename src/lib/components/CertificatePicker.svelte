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

	const FIELD_DEFINITIONS: { id: ActiveField; label: string }[] = [
		{ id: 'name', label: 'Nome do Aluno' },
		{ id: 'cpf', label: 'CPF do Aluno' },
		{ id: 'date', label: 'Data de Emissão' },
		{ id: 'organizer_name', label: 'Nome Organizador' },
		{ id: 'organizer_cpf', label: 'CPF Organizador' }
	];

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

	// Garante que os campos existam com valores padrão e enabled = true
	if (!config.name_field) {
		config.name_field = { x: 600, y: 440, font_size: 32, align: 'center', color: '#18181b', enabled: true };
	} else if (config.name_field.enabled === undefined) {
		config.name_field.enabled = true;
	}

	if (!config.cpf_field) {
		config.cpf_field = { x: 600, y: 500, font_size: 16, align: 'center', color: '#52525b', enabled: true };
	} else if (config.cpf_field.enabled === undefined) {
		config.cpf_field.enabled = true;
	}

	if (!config.date_field) {
		config.date_field = { x: 950, y: 700, font_size: 14, align: 'right', color: '#71717a', enabled: true };
	} else if (config.date_field.enabled === undefined) {
		config.date_field.enabled = true;
	}

	if (!config.organizer_name_field) {
		config.organizer_name_field = { x: 300, y: 680, font_size: 16, align: 'center', color: '#18181b', enabled: true };
	} else if (config.organizer_name_field.enabled === undefined) {
		config.organizer_name_field.enabled = true;
	}

	if (!config.organizer_cpf_field) {
		config.organizer_cpf_field = { x: 300, y: 710, font_size: 12, align: 'center', color: '#52525b', enabled: true };
	} else if (config.organizer_cpf_field.enabled === undefined) {
		config.organizer_cpf_field.enabled = true;
	}

	function getField(field: ActiveField): FieldConfig {
		switch (field) {
			case 'name':
				if (!config.name_field) config.name_field = { x: 600, y: 440, font_size: 32, align: 'center', color: '#18181b', enabled: true };
				if (config.name_field.enabled === undefined) config.name_field.enabled = true;
				return config.name_field;
			case 'cpf':
				if (!config.cpf_field) config.cpf_field = { x: 600, y: 500, font_size: 16, align: 'center', color: '#52525b', enabled: true };
				if (config.cpf_field.enabled === undefined) config.cpf_field.enabled = true;
				return config.cpf_field;
			case 'date':
				if (!config.date_field) config.date_field = { x: 950, y: 700, font_size: 14, align: 'right', color: '#71717a', enabled: true };
				if (config.date_field.enabled === undefined) config.date_field.enabled = true;
				return config.date_field;
			case 'organizer_name':
				if (!config.organizer_name_field) config.organizer_name_field = { x: 300, y: 680, font_size: 16, align: 'center', color: '#18181b', enabled: true };
				if (config.organizer_name_field.enabled === undefined) config.organizer_name_field.enabled = true;
				return config.organizer_name_field;
			case 'organizer_cpf':
				if (!config.organizer_cpf_field) config.organizer_cpf_field = { x: 300, y: 710, font_size: 12, align: 'center', color: '#52525b', enabled: true };
				if (config.organizer_cpf_field.enabled === undefined) config.organizer_cpf_field.enabled = true;
				return config.organizer_cpf_field;
		}
	}

	function isFieldEnabled(field: ActiveField): boolean {
		const f = getField(field);
		return f.enabled !== false;
	}

	function toggleField(field: ActiveField, e?: Event) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		const f = getField(field);
		f.enabled = f.enabled === false ? true : false;
		if (f.enabled) {
			activeField = field;
		}
		notifyChange();
	}

	function selectField(field: ActiveField) {
		activeField = field;
	}

	function getFieldLabel(field: ActiveField): string {
		return FIELD_DEFINITIONS.find((d) => d.id === field)?.label || field;
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

		const field = getField(activeField);
		field.x = naturalX;
		field.y = naturalY;

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

	function resetToDefaultTemplate() {
		userTemplateUrl = null;
		notifyChange('');
	}

	function notifyChange(dataUrl?: string) {
		if (onchange) {
			onchange(config, dataUrl !== undefined ? dataUrl : currentTemplateUrl);
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
	<!-- 1. Cabeçalho do Calibrador: Ação de Carregar Template Diferenciada -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e4e4e7]">
		<div class="space-y-0.5">
			<div class="flex items-center space-x-2">
				<img src="/icons/icon_pen.png" alt="" class="w-4 h-4 object-contain" />
				<h4 class="font-serif text-sm font-semibold text-[#18181b]">
					Calibragem dos Itens do Certificado
				</h4>
			</div>
			<p class="text-xs text-[#71717a] font-sans">
				Ative ou desative itens no toggle e selecione o campo para calibrar no certificado.
			</p>
		</div>

		<!-- Botão de Upload do Template destacado com estilo de ação gráfica -->
		<div class="flex items-center space-x-2 shrink-0">
			{#if userTemplateUrl}
				<button
					type="button"
					onclick={resetToDefaultTemplate}
					class="text-xs font-mono text-[#71717a] hover:text-red-700 underline cursor-pointer"
				>
					Restaurar Padrão
				</button>
			{/if}

			<label class="cursor-pointer inline-flex items-center space-x-2 px-3.5 h-9 text-xs uppercase tracking-wider font-mono font-medium border-2 border-dashed border-[#18181b] bg-[#fbfbfb] text-[#18181b] hover:bg-[#18181b] hover:text-white transition-all shadow-xs">
				<img src="/icons/icon_file.png" alt="" class="w-3.5 h-3.5 object-contain" />
				<span>{userTemplateUrl ? 'Substituir Imagem do Template' : 'Carregar Imagem de Template (PNG/JPG)'}</span>
				<input
					type="file"
					accept="image/png,image/jpeg,image/webp"
					class="hidden"
					onchange={handleFileUpload}
				/>
			</label>
		</div>
	</div>

	<!-- 2. Barra de Seleção de Itens com Toggles Switches Independentes -->
	<div class="flex flex-wrap items-center gap-2 pt-1">
		<span class="text-xs uppercase tracking-widest font-mono text-[#71717a] font-medium mr-1">
			Itens:
		</span>

		{#each FIELD_DEFINITIONS as item}
			{@const enabled = isFieldEnabled(item.id)}
			{@const isSelected = activeField === item.id}
			<button
				type="button"
				onclick={() => selectField(item.id)}
				class="group inline-flex items-center space-x-2.5 px-3 py-1.5 border transition-all text-xs font-sans cursor-pointer {isSelected
					? 'border-[#18181b] bg-white ring-2 ring-[#18181b] font-medium shadow-xs'
					: 'border-[#e4e4e7] bg-[#fafafa] text-[#52525b] hover:border-[#a1a1aa] hover:bg-white'} {!enabled ? 'opacity-60 bg-[#f4f4f5]' : ''}"
			>
				<!-- Toggle Switch deslizante -->
				<span
					role="switch"
					aria-checked={enabled}
					tabindex="0"
					onclick={(e) => toggleField(item.id, e)}
					onkeydown={(e) => {
						if (e.key === ' ' || e.key === 'Enter') {
							e.preventDefault();
							toggleField(item.id, e);
						}
					}}
					title={enabled ? `Desativar ${item.label} do certificado` : `Ativar ${item.label} no certificado`}
					class="relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {enabled
						? 'bg-[#18181b]'
						: 'bg-[#d4d4d8]'}"
				>
					<span
						aria-hidden="true"
						class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out {enabled
							? 'translate-x-3'
							: 'translate-x-0'}"
					></span>
				</span>

				<!-- Rótulo do Item -->
				<span class="{isSelected ? 'text-[#18181b]' : 'text-[#3f3f46]'} {!enabled ? 'line-through text-[#a1a1aa]' : ''}">
					{item.label}
				</span>
			</button>
		{/each}
	</div>

	<!-- 3. Canvas / Imagem interativa do Certificado -->
	<div
		bind:this={containerElement}
		class="relative w-full border border-[#d4d4d8] bg-[#f4f4f5] select-none overflow-hidden"
	>
		<!-- Instrução flutuante sutil -->
		<div class="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs text-[#71717a] border border-[#e4e4e7] pointer-events-none font-sans">
			Item Selecionado: <strong class="text-[#18181b] font-medium uppercase">{getFieldLabel(activeField)}</strong>
			{#if !isFieldEnabled(activeField)}
				<span class="text-red-700 font-mono ml-1">(Desativado no Certificado)</span>
			{/if}
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
						(Template padrão ativo. Para usar o seu próprio design gráfico, faça upload da imagem acima ou clique para definir as posições dos textos)
					</p>
					<div class="h-6"></div>
				</div>
			</div>
		{/if}

		<!-- Marcadores com Retículo (Crosshair) das posições -->
		<!-- 1. Marcador Nome -->
		{#if config.name_field && (config.name_field.enabled !== false || activeField === 'name')}
			{@const pos = getPercentPos(config.name_field)}
			{@const isEnabled = config.name_field.enabled !== false}
			<div
				class="absolute pointer-events-none flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 {isEnabled ? '' : 'opacity-40'}"
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
					[ Nome do Aluno {isEnabled ? '' : '(Desativado)'} ]
				</span>
			</div>
		{/if}

		<!-- 2. Marcador CPF -->
		{#if config.cpf_field && (config.cpf_field.enabled !== false || activeField === 'cpf')}
			{@const pos = getPercentPos(config.cpf_field)}
			{@const isEnabled = config.cpf_field.enabled !== false}
			<div
				class="absolute pointer-events-none flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 {isEnabled ? '' : 'opacity-40'}"
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
					[ CPF: 000.000.000-00 {isEnabled ? '' : '(Desativado)'} ]
				</span>
			</div>
		{/if}

		<!-- 3. Marcador Data -->
		{#if config.date_field && (config.date_field.enabled !== false || activeField === 'date')}
			{@const pos = getPercentPos(config.date_field)}
			{@const isEnabled = config.date_field.enabled !== false}
			<div
				class="absolute pointer-events-none flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 {isEnabled ? '' : 'opacity-40'}"
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
					[ 22/09/2026 {isEnabled ? '' : '(Desativado)'} ]
				</span>
			</div>
		{/if}

		<!-- 4. Marcador Nome do Organizador -->
		{#if config.organizer_name_field && (config.organizer_name_field.enabled !== false || activeField === 'organizer_name')}
			{@const pos = getPercentPos(config.organizer_name_field)}
			{@const isEnabled = config.organizer_name_field.enabled !== false}
			<div
				class="absolute pointer-events-none flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 {isEnabled ? '' : 'opacity-40'}"
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
					[ Nome do Organizador {isEnabled ? '' : '(Desativado)'} ]
				</span>
			</div>
		{/if}

		<!-- 5. Marcador CPF do Organizador -->
		{#if config.organizer_cpf_field && (config.organizer_cpf_field.enabled !== false || activeField === 'organizer_cpf')}
			{@const pos = getPercentPos(config.organizer_cpf_field)}
			{@const isEnabled = config.organizer_cpf_field.enabled !== false}
			<div
				class="absolute pointer-events-none flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 {isEnabled ? '' : 'opacity-40'}"
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
					[ CPF Organizador {isEnabled ? '' : '(Desativado)'} ]
				</span>
			</div>
		{/if}
	</div>

	<!-- 4. Controles de ajuste fino para o campo selecionado -->
	{#if currentConfig}
		<div class="p-4 border border-[#e4e4e7] bg-white space-y-4">
			<div class="flex items-center justify-between pb-3 border-b border-[#f4f4f5]">
				<div class="flex items-center space-x-2">
					<span class="text-xs uppercase font-mono font-semibold text-[#18181b]">
						Ajustes: {getFieldLabel(activeField)}
					</span>
					{#if currentConfig.enabled === false}
						<span class="text-[10px] font-mono uppercase px-2 py-0.5 bg-neutral-100 text-neutral-600 border border-neutral-300">
							Campo Desativado
						</span>
					{:else}
						<span class="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300">
							Ativo no Certificado
						</span>
					{/if}
				</div>

				<button
					type="button"
					onclick={() => toggleField(activeField)}
					class="text-xs font-mono underline hover:text-[#18181b] cursor-pointer {currentConfig.enabled === false ? 'text-emerald-700 font-medium' : 'text-neutral-500'}"
				>
					{currentConfig.enabled === false ? 'Ativar este item no certificado' : 'Desativar este item do certificado'}
				</button>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
								class="flex-1 h-9 text-xs uppercase font-mono border transition-colors cursor-pointer {currentConfig.align === align
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
		</div>
	{/if}
</div>
