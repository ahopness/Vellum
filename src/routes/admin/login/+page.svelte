<script lang="ts">
	import { enhance } from '$app/forms';
	import FormField from '$lib/components/FormField.svelte';
	import { page } from '$app/state';

	let { form } = $props();

	let email = $state('');
	let name = $state('');
	let cpf = $state('');
	let showNewFields = $state(false);
	let loading = $state(false);

	const urlError = page.url.searchParams.get('error');
</script>

<div class="max-w-md mx-auto w-full px-4 sm:px-6 py-16 sm:py-24 space-y-10">
	<header class="space-y-3">
		<span class="text-xs uppercase tracking-widest font-mono text-[#71717a]">
			Autenticação Sem Senha
		</span>
		<h1 class="font-serif text-3xl font-semibold text-[#18181b]">
			Acesso do Organizador
		</h1>
		<p class="font-sans text-sm text-[#71717a] leading-relaxed">
			Informe seu e-mail institucional ou acadêmico. Enviaremos um link mágico seguro para acesso instantâneo.
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
				<span class="inline-block text-xs font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
					E-mail Enviado com Sucesso
				</span>
				<h3 class="font-serif text-xl font-medium text-[#18181b]">
					Verifique sua caixa de entrada
				</h3>
				<p class="font-sans text-sm text-[#52525b] leading-relaxed">
					Enviamos o link de acesso seguro para <strong>{form.email}</strong>. O link expira em 15 minutos e pode ser utilizado uma única vez.
				</p>
			</div>

			{#if form.devUrl}
				<!-- Atalho de desenvolvimento local -->
				<div class="p-4 border border-[#e4e4e7] bg-white space-y-2">
					<div class="text-[11px] uppercase tracking-wider font-mono text-neutral-500">
						[Ambiente de Desenvolvimento Local]
					</div>
					<p class="text-xs text-[#71717a]">
						Nenhuma chave do Resend configurada; você pode acessar diretamente pelo link abaixo:
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
				<a
					href="/admin/login"
					class="text-xs font-mono uppercase tracking-wider text-[#71717a] hover:text-[#18181b] transition-colors"
				>
					← Tentar outro e-mail
				</a>
			</div>
		</div>
	{:else}
		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
			class="space-y-6 border-t border-[#e4e4e7] pt-6"
		>
			<FormField
				label="Seu E-mail"
				name="email"
				type="email"
				bind:value={email}
				placeholder="ex: organizador@universidade.edu.br"
				required
				autocomplete="email"
				inputmode="email"
				error={form?.error}
			/>

			<!-- Opção de cadastro de novos dados -->
			<div>
				<button
					type="button"
					onclick={() => (showNewFields = !showNewFields)}
					class="text-xs text-[#71717a] hover:text-[#18181b] underline underline-offset-2 transition-colors font-sans"
				>
					{showNewFields ? '— Ocultar dados adicionais' : '+ Primeiro acesso? Informar Nome e CPF'}
				</button>
			</div>

			{#if showNewFields}
				<div class="space-y-4 pt-2 border-t border-[#f4f4f5]">
					<FormField
						label="Nome Completo do Responsável"
						name="name"
						bind:value={name}
						placeholder="Como aparecerá na assinatura"
						autocomplete="name"
					/>
					<FormField
						label="CPF do Organizador (Obrigatório para emissor)"
						name="cpf"
						bind:value={cpf}
						placeholder="000.000.000-00"
						helperText="Utilizado para validação de responsabilidade institucional."
					/>
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full h-12 bg-[#18181b] text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
			>
				<span>{loading ? 'Gerando Link...' : 'Enviar Link de Acesso'}</span>
			</button>

			<div class="text-center pt-2">
				<a href="/" class="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] hover:text-[#18181b] transition-colors">
					← Retornar à página inicial
				</a>
			</div>
		</form>
	{/if}
</div>
