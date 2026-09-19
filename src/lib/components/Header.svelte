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
		<div class="flex items-center space-x-3">
			<a href="/" class="flex items-center space-x-2.5 hover:opacity-85 transition-opacity">
				<img src="/logo.png" alt="Vellum Logo" class="w-7 h-7 object-contain" />
				<span class="font-serif text-2xl font-semibold tracking-tight text-[#18181b]">
					Vellum
				</span>
			</a>
			<span class="text-xs uppercase tracking-widest text-[#71717a] hidden sm:inline font-mono border-l border-[#d4d4d8] pl-3">
				Presença & Certificados
			</span>
		</div>

		<nav class="flex items-center space-x-5 text-sm font-sans">
			{#if admin}
				<a href="/admin" class="flex items-center space-x-1.5 text-[#18181b] hover:text-black font-medium transition-colors">
					<img src="/icons/icon_calendar.png" alt="" class="w-4 h-4 object-contain" />
					<span>Meus Eventos</span>
				</a>
				<a href="/admin/events/new" class="flex items-center space-x-1.5 text-[#71717a] hover:text-[#18181b] transition-colors">
					<img src="/icons/icon_pen.png" alt="" class="w-3.5 h-3.5 object-contain" />
					<span>Criar Evento</span>
				</a>
				<span class="text-xs text-[#a1a1aa] hidden md:inline font-mono">
					{admin.email}
				</span>
				<form method="POST" action="/admin/logout" class="inline flex items-center" data-sveltekit-reload>
					<button
						type="submit"
						class="flex items-center space-x-1 text-xs uppercase tracking-wider text-[#71717a] hover:text-red-700 transition-colors cursor-pointer"
					>
						<img src="/icons/icon_door.png" alt="" class="w-3.5 h-3.5 object-contain opacity-70" />
						<span>Sair</span>
					</button>
				</form>
			{:else}
				<a
					href="/politica-de-privacidade"
					class="flex items-center space-x-1 text-xs text-[#71717a] hover:text-[#18181b] transition-colors hidden sm:flex"
				>
					<img src="/icons/icon_question.png" alt="" class="w-3.5 h-3.5 object-contain opacity-75" />
					<span>Privacidade</span>
				</a>
				<a
					href="/admin/login"
					class="inline-flex items-center justify-center space-x-1.5 h-10 px-4 text-xs uppercase tracking-widest font-medium border border-[#18181b] text-[#18181b] hover:bg-[#18181b] hover:text-white transition-colors"
				>
					<img src="/icons/icon_door.png" alt="" class="w-3.5 h-3.5 object-contain" />
					<span>Área do Organizador</span>
				</a>
			{/if}
		</nav>
	</div>
</header>
