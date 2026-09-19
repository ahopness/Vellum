<script lang="ts">
	interface Props {
		admin?: {
			name: string;
			email: string;
		} | null;
	}

	let { admin = null }: Props = $props();
</script>

<header class="w-full border-b border-[#e4e4e7] bg-[#fafafa]">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
		<div class="flex items-baseline space-x-3">
			<a href="/" class="font-serif text-2xl font-semibold tracking-tight text-[#18181b] hover:opacity-80 transition-opacity">
				Vellum
			</a>
			<span class="text-xs uppercase tracking-widest text-[#71717a] hidden sm:inline font-mono">
				Presença & Certificados
			</span>
		</div>

		<nav class="flex items-center space-x-6 text-sm font-sans">
			{#if admin}
				<a href="/admin" class="text-[#18181b] hover:text-black font-medium transition-colors">
					Meus Eventos
				</a>
				<a href="/admin/events/new" class="text-[#71717a] hover:text-[#18181b] transition-colors">
					+ Criar Evento
				</a>
				<span class="text-xs text-[#a1a1aa] hidden md:inline font-mono">
					{admin.email}
				</span>
				<a
					href="/admin/logout"
					class="text-xs uppercase tracking-wider text-[#71717a] hover:text-red-700 transition-colors"
				>
					Sair
				</a>
			{:else}
				<a
					href="/politica-de-privacidade"
					class="text-xs text-[#71717a] hover:text-[#18181b] transition-colors hidden sm:inline"
				>
					Privacidade (LGPD)
				</a>
				<a
					href="/admin/login"
					class="inline-flex items-center justify-center h-10 px-4 text-xs uppercase tracking-widest font-medium border border-[#18181b] text-[#18181b] hover:bg-[#18181b] hover:text-white transition-colors"
				>
					Área do Organizador
				</a>
			{/if}
		</nav>
	</div>
</header>
