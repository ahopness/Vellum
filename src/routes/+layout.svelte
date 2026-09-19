<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';

	let { data, children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-[#fafafa] text-[#18181b]">
	<Header admin={data.admin} />

	<main class="flex-1 flex flex-col">
		{@render children()}
	</main>

	<footer class="w-full border-t border-[#e4e4e7] py-8 mt-auto bg-[#fafafa]">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#71717a] font-sans space-y-4 sm:space-y-0">
			<div class="flex items-center space-x-2">
				<span class="font-serif font-medium text-[#18181b]">Vellum</span>
				<span>—</span>
				<span>Sistema Editorial de Presença & Certificados</span>
			</div>

			<div class="flex items-center space-x-6">
				<a href="/politica-de-privacidade" class="hover:text-[#18181b] transition-colors underline underline-offset-4 decoration-[#d4d4d8]">
					Política de Privacidade (LGPD)
				</a>
				<span class="font-mono text-[11px] text-[#a1a1aa]">v1.0</span>
			</div>
		</div>
	</footer>
</div>
