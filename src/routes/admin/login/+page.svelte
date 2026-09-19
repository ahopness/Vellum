<script lang="ts">
	import { enhance } from '$app/forms';
	import FormField from '$lib/components/FormField.svelte';
	import { maskCpf } from '$lib/utils/formatters';
	import { page } from '$app/state';

	let { form } = $props();

	type AuthMode = 'login' | 'register';
	let mode = $state<AuthMode>('login');
	let email = $state('');
	let name = $state('');
	let cpf = $state('');
	let loading = $state(false);

	const urlError = page.url.searchParams.get('error');

	// Se o servidor retornou que o admin não é cadastrado, muda para modo de cadastro
	$effect(() => {
		if (form?.mode === 'register') {
			mode = 'register';
		}
		if (form?.email) email = form.email;
		if (form?.name) name = form.name;
		if (form?.cpf) cpf = form.cpf;
	});

	function handleCpfInput(e: Event & { currentTarget: HTMLInputElement }) {
		cpf = maskCpf(e.currentTarget.value);
	}
</script>

<div class="max-w-md mx-auto w-full px-4 sm:px-6 py-16 sm:py-24 space-y-10">
	<header class="space-y-3">
		<div class="flex items-center space-x-2">
			<img src="/icons/icon_door.png" alt="" class="w-5 h-5 object-contain" />
			<span class="text-xs uppercase tracking-widest font-mono text-[#71717a]">
				Acesso ao Painel
			</span>
		</div>
		<h1 class="font-serif text-3xl font-semibold text-[#18181b]">
			{mode === 'login' ? 'Entrar como Organizador' : 'Cadastrar Organizador'}
		</h1>
		<p class="font-sans text-sm text-[#71717a] leading-relaxed">
			{mode === 'login'
				? 'Informe seu e-mail cadastrado para receber o link de acesso seguro.'
				: 'Preencha seus dados institucionais para se habilitar como emissor responsável.'}
		</p>
	</header>

	{#if urlError === 'invalid_token'}
		<div class="p-3 bg-red-50 border-l-2 border-red-600 text-xs text-red-800 font-sans">
			O link de acesso utilizado é inválido, expirou ou já foi utilizado. Solicite um novo abaixo.
		</div>
	{/if}

	{#if form?.success}
		<div class="space-y-6 border-t border-[#e4e4e7] pt-6">
			<div class="space-y-2">
				<span class="inline-flex items-center space-x-1 text-xs font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
					<span>✓</span>
					<span>{form.isNewRegistration ? 'Cadastro Realizado & Link Enviado' : 'Link de Acesso Enviado'}</span>
				</span>
				<h3 class="font-serif text-xl font-medium text-[#18181b]">
					Verifique sua caixa de entrada
				</h3>
				<p class="font-sans text-sm text-[#52525b] leading-relaxed">
					Enviamos o link de acesso seguro para <strong>{form.email}</strong>. O link expira em 15 minutos e é de uso único.
				</p>
			</div>

			{#if form.devUrl}
				<!-- Atalho de desenvolvimento local -->
				<div class="p-4 border border-[#e4e4e7] bg-white space-y-2">
					<div class="text-[11px] uppercase tracking-wider font-mono text-neutral-500">
						[Modo de Desenvolvimento / Sem Chave Resend]
					</div>
					<p class="text-xs text-[#71717a]">
						Acesse diretamente através do link seguro gerado:
					</p>
					<a
						href={form.devUrl}
						class="inline-block text-xs font-mono text-blue-700 underline underline-offset-2 break-all"
					>
						{form.devUrl}
					</a>
					<div class="pt-2">
						<a
							href={form.devUrl}
							class="inline-flex items-center justify-center h-10 px-4 text-xs font-medium uppercase tracking-wider bg-[#18181b] text-white hover:bg-black"
						>
							Entrar Imediatamente →
						</a>
					</div>
				</div>
			{/if}

			<div>
				<button
					type="button"
					onclick={() => {
						if (form) form.success = false;
					}}
					class="text-xs font-mono uppercase tracking-wider text-[#71717a] hover:text-[#18181b] transition-colors"
				>
					← Voltar à tela de login
				</button>
			</div>
		</div>
	{:else}
		<!-- Alternador de Modo (Anti-card tabs) -->
		<div class="flex border-b border-[#e4e4e7] font-mono text-xs">
			<button
				type="button"
				onclick={() => (mode = 'login')}
				class="flex-1 pb-2.5 text-center transition-colors border-b-2 {mode === 'login'
					? 'border-[#18181b] font-medium text-[#18181b]'
					: 'border-transparent text-[#71717a] hover:text-[#18181b]'}"
			>
				Já sou Cadastrado
			</button>
			<button
				type="button"
				onclick={() => (mode = 'register')}
				class="flex-1 pb-2.5 text-center transition-colors border-b-2 {mode === 'register'
					? 'border-[#18181b] font-medium text-[#18181b]'
					: 'border-transparent text-[#71717a] hover:text-[#18181b]'}"
			>
				Novo Organizador
			</button>
		</div>

		{#if form?.error}
			<div class="p-3 bg-red-50 border-l-2 border-red-600 text-xs text-red-800 font-sans leading-relaxed">
				{form.error}
			</div>
		{/if}

		<!-- Formulário de Login (Apenas E-mail com verificação estrita) -->
		{#if mode === 'login'}
			<form
				method="POST"
				action="?/login"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-6 pt-2"
			>
				<FormField
					label="Seu E-mail Institucional"
					name="email"
					type="email"
					bind:value={email}
					placeholder="ex: organizador@universidade.edu.br"
					required
					autocomplete="email"
					inputmode="email"
				/>

				<button
					type="submit"
					disabled={loading}
					class="w-full h-12 bg-[#18181b] text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
				>
					{#if loading}
						<img src="/icons/icon_loading.gif" alt="" class="w-4 h-4" />
						<span>Verificando...</span>
					{:else}
						<span>Enviar Link de Acesso</span>
					{/if}
				</button>
			</form>
		<!-- Formulário de Cadastro Obrigatório (Nome, Email, CPF) -->
		{:else}
			<form
				method="POST"
				action="?/register"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-6 pt-2"
			>
				<FormField
					label="Nome Completo do Responsável"
					name="name"
					bind:value={name}
					placeholder="Como sairá na assinatura de certificados"
					required
					autocomplete="name"
				/>

				<FormField
					label="E-mail Institucional ou Pessoal"
					name="email"
					type="email"
					bind:value={email}
					placeholder="seu.email@exemplo.com"
					required
					autocomplete="email"
					inputmode="email"
				/>

				<div class="space-y-1.5 w-full">
					<label for="reg-cpf" class="block text-xs uppercase tracking-wider text-[#71717a] font-sans font-medium">
						CPF do Organizador (Obrigatório)
					</label>

					<input
						id="reg-cpf"
						name="cpf"
						type="text"
						bind:value={cpf}
						oninput={handleCpfInput}
						placeholder="000.000.000-00"
						required
						inputmode="numeric"
						class="w-full h-12 bg-white px-3 border border-[#d4d4d8] rounded-none font-sans text-base text-[#18181b] placeholder:text-[#a1a1aa] transition-colors focus:outline-none focus:ring-1 focus:ring-[#18181b] focus:border-[#18181b]"
					/>

					<p class="text-[11px] text-[#71717a] font-sans leading-relaxed pt-0.5">
						O CPF do organizador é exigido para fins de auditoria e responsabilidade jurídica pela emissão dos certificados.
					</p>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full h-12 bg-[#18181b] text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
				>
					{#if loading}
						<img src="/icons/icon_loading.gif" alt="" class="w-4 h-4" />
						<span>Cadastrando...</span>
					{:else}
						<span>Concluir Cadastro & Entrar</span>
					{/if}
				</button>
			</form>
		{/if}

		<div class="text-center pt-4 border-t border-[#e4e4e7]">
			<a href="/" class="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] hover:text-[#18181b] transition-colors">
				← Retornar à página inicial
			</a>
		</div>
	{/if}
</div>
