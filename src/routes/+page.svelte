<script lang="ts">
	import { page } from '$app/state';

	let { data } = $props();
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-16">
	{#if page.url.searchParams.get('account_deleted')}
		<div class="border border-red-200 bg-red-50 p-4 text-xs font-mono text-red-900 flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<span>✓</span>
				<span>Sua conta de organizador e todos os eventos, arquivos e dados associados foram excluídos definitivamente.</span>
			</div>
			<a href="/" class="text-red-700 hover:text-red-950 font-bold ml-4">✕</a>
		</div>
	{/if}

	<!-- Hero Section Editorial -->
	<section class="space-y-6">
		<h1 class="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#18181b] leading-[1.12]">
			Sua solução para publicação & credenciamento acadêmico.<br />
		</h1>

		<p class="font-sans text-lg sm:text-xl text-[#52525b] max-w-2xl leading-relaxed">
			Desenhado para auditórios, seminários e salas de aula, como simplicidade e fluidez em mente.
		</p>

		<div class="pt-4 flex flex-wrap items-center gap-4">
			{#if data.admin}
				<a
					href="/admin"
					class="inline-flex items-center justify-center space-x-2 h-12 px-6 bg-[#18181b] text-white text-sm uppercase tracking-wider font-medium hover:bg-black transition-colors"
				>
					<img src="/icons/icon_calendar.png" alt="" class="w-4 h-4 object-contain invert brightness-0" />
					<span>Acessar Meus Eventos →</span>
				</a>
				<a
					href="/admin/events/new"
					class="inline-flex items-center justify-center space-x-2 h-12 px-6 border border-[#18181b] text-[#18181b] text-sm uppercase tracking-wider font-medium hover:bg-[#18181b] hover:text-white transition-colors"
				>
					<img src="/icons/icon_pen.png" alt="" class="w-4 h-4 object-contain" />
					<span>Criar Novo Evento</span>
				</a>
			{:else}
				<a
					href="/admin/login"
					class="inline-flex items-center justify-center space-x-2 h-12 px-6 bg-[#18181b] text-white text-sm uppercase tracking-wider font-medium hover:bg-black transition-colors"
				>
					<img src="/icons/icon_door.png" alt="" class="w-4 h-4 object-contain invert brightness-0" />
					<span>Área do Organizador →</span>
				</a>
			{/if}
		</div>
	</section>

	<!-- Divisor Hairline de 1px -->
	<hr class="border-t border-[#e4e4e7]" />

	<!-- Pilares Estruturais (Layout Aberto Anti-Card) -->
	<!--
		<section class="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
			<div class="space-y-3">
				<div class="flex items-center space-x-2">
					<img src="/icons/icon_eraser.png" alt="" class="w-4 h-4 object-contain opacity-80" />
					<span class="font-mono text-xs text-[#a1a1aa]">01 / PRIVACIDADE</span>
				</div>
				<h3 class="font-serif text-xl font-medium text-[#18181b]">
					LGPD por Design
				</h3>
				<p class="font-sans text-sm text-[#71717a] leading-relaxed">
					O CPF do participante é processado estritamente na memória do navegador pelo motor PDF. Nosso banco de dados nunca salva nem recebe o CPF de alunos.
				</p>
			</div>
			
			<div class="space-y-3">
				<div class="flex items-center space-x-2">
					<img src="/icons/icon_files.png" alt="" class="w-4 h-4 object-contain opacity-80" />
					<span class="font-mono text-xs text-[#a1a1aa]">02 / PERFORMANCE</span>
				</div>
				<h3 class="font-serif text-xl font-medium text-[#18181b]">
					Leveza no 4G
				</h3>
				<p class="font-sans text-sm text-[#71717a] leading-relaxed">
				Construído em SvelteKit sem Virtual DOM. Bundle cirúrgico inferior a 30 KB que abre instantaneamente em redes móveis instáveis de auditório.
			</p>
		</div>
		
		<div class="space-y-3">
			<div class="flex items-center space-x-2">
				<img src="/icons/icon_calendar.png" alt="" class="w-4 h-4 object-contain opacity-80" />
				<span class="font-mono text-xs text-[#a1a1aa]">03 / SEGURANÇA</span>
			</div>
			<h3 class="font-serif text-xl font-medium text-[#18181b]">
				Janela Temporal
			</h3>
			<p class="font-sans text-sm text-[#71717a] leading-relaxed">
				Presenças validadas no servidor com tolerância temporal de ±15 minutos e exportação para planilhas protegida contra ataques de injeção CSV.
			</p>
		</div>
	</section>
	-->
	
	<hr class="border-t border-[#e4e4e7]" />
	
	<section class="py-4 space-y-4">
		<div class="flex items-center space-x-2">
			<img src="/icons/icon_hand.png" alt="" class="w-4 h-4 object-contain opacity-70" />
			<h4 class="font-mono text-xs uppercase tracking-widest text-[#71717a]">
				Filosofia
			</h4>
		</div>
		<p class="font-serif text-lg text-[#52525b] italic leading-relaxed">
			“O nome Vellum evoca os pergaminhos finos onde o conhecimento clássico era fixado. Acreditamos que ferramentas acadêmicas devem ser silenciosas, precisas e dignas do conteúdo que registram.”
		</p>
	</section>
</div>
