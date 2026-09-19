<script lang="ts">
	let { data } = $props();
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-16">
	<!-- Hero Section Editorial -->
	<section class="space-y-6">
		<div class="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-mono text-[#71717a] border-b border-[#18181b] pb-1">
			<span>Publicação & Credenciamento Acadêmico</span>
		</div>

		<h1 class="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#18181b] leading-[1.12]">
			Presença minimalista.<br />
			Certificados imediatos.<br />
			<span class="italic font-normal text-[#52525b]">Zero burocracia.</span>
		</h1>

		<p class="font-sans text-lg sm:text-xl text-[#52525b] max-w-2xl leading-relaxed">
			O Vellum foi desenhado para auditórios, seminários e salas de aula. Foco absoluto na leitura tipográfica, ausência de poluição visual e conformidade rigorosa com a LGPD.
		</p>

		<div class="pt-4 flex flex-wrap items-center gap-4">
			{#if data.admin}
				<a
					href="/admin"
					class="inline-flex items-center justify-center h-12 px-6 bg-[#18181b] text-white text-sm uppercase tracking-wider font-medium hover:bg-black transition-colors"
				>
					Acessar Meus Eventos →
				</a>
				<a
					href="/admin/events/new"
					class="inline-flex items-center justify-center h-12 px-6 border border-[#18181b] text-[#18181b] text-sm uppercase tracking-wider font-medium hover:bg-[#18181b] hover:text-white transition-colors"
				>
					Criar Novo Evento
				</a>
			{:else}
				<a
					href="/admin/login"
					class="inline-flex items-center justify-center h-12 px-6 bg-[#18181b] text-white text-sm uppercase tracking-wider font-medium hover:bg-black transition-colors"
				>
					Área do Organizador →
				</a>
				<a
					href="/politica-de-privacidade"
					class="inline-flex items-center justify-center h-12 px-6 border border-[#d4d4d8] text-[#52525b] text-sm uppercase tracking-wider font-medium hover:border-[#18181b] hover:text-[#18181b] transition-colors"
				>
					Conhecer a Política LGPD
				</a>
			{/if}
		</div>
	</section>

	<!-- Divisor Hairline de 1px -->
	<hr class="border-t border-[#e4e4e7]" />

	<!-- Pilares Estruturais (Layout Aberto Anti-Card) -->
	<section class="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
		<div class="space-y-3">
			<span class="font-mono text-xs text-[#a1a1aa]">01 / PRIVACIDADE</span>
			<h3 class="font-serif text-xl font-medium text-[#18181b]">
				LGPD por Design
			</h3>
			<p class="font-sans text-sm text-[#71717a] leading-relaxed">
				O CPF do participante é processado estritamente na memória do navegador pelo motor PDF. Nosso banco de dados nunca salva nem recebe o CPF de alunos.
			</p>
		</div>

		<div class="space-y-3">
			<span class="font-mono text-xs text-[#a1a1aa]">02 / PERFORMANCE</span>
			<h3 class="font-serif text-xl font-medium text-[#18181b]">
				Leveza no 4G
			</h3>
			<p class="font-sans text-sm text-[#71717a] leading-relaxed">
				Construído em SvelteKit sem Virtual DOM. Bundle cirúrgico inferior a 30 KB que abre instantaneamente em redes móveis instáveis de auditório.
			</p>
		</div>

		<div class="space-y-3">
			<span class="font-mono text-xs text-[#a1a1aa]">03 / SEGURANÇA</span>
			<h3 class="font-serif text-xl font-medium text-[#18181b]">
				Janela Temporal
			</h3>
			<p class="font-sans text-sm text-[#71717a] leading-relaxed">
				Presenças validadas no servidor com tolerância temporal de ±15 minutos e exportação para planilhas protegida contra ataques de injeção CSV.
			</p>
		</div>
	</section>

	<!-- Divisor Hairline de 1px -->
	<hr class="border-t border-[#e4e4e7]" />

	<!-- Nota Editorial de Filosofia -->
	<section class="py-4 space-y-4">
		<h4 class="font-mono text-xs uppercase tracking-widest text-[#71717a]">
			Filosofia Editorial & Tipografia
		</h4>
		<p class="font-serif text-lg text-[#52525b] italic leading-relaxed">
			“O nome Vellum evoca os pergaminhos finos onde o conhecimento clássico era fixado. Acreditamos que ferramentas acadêmicas devem ser silenciosas, precisas e dignas do conteúdo que registram.”
		</p>
	</section>
</div>
