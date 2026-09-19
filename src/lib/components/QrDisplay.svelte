<script lang="ts">
	import QRCode from 'qrcode';

	interface Props {
		url: string;
		title?: string;
	}

	let { url, title = 'QR Code de Credenciamento' }: Props = $props();

	let qrDataUrl = $state<string>('');
	let copied = $state(false);

	$effect(() => {
		if (url) {
			QRCode.toDataURL(url, {
				width: 512,
				margin: 2,
				color: {
					dark: '#18181b',
					light: '#ffffff'
				}
			})
				.then((dataUri) => {
					qrDataUrl = dataUri;
				})
				.catch((err) => {
					console.error('Erro ao gerar QR Code:', err);
				});
		}
	});

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 2500);
		} catch (err) {
			console.error('Falha ao copiar:', err);
		}
	}
</script>

<div class="flex flex-col items-center space-y-4 text-center">
	{#if qrDataUrl}
		<div class="p-3 bg-white border border-[#d4d4d8] shadow-xs">
			<img src={qrDataUrl} alt={title} class="w-56 h-56 sm:w-64 sm:h-64 block" />
		</div>
	{:else}
		<div class="w-56 h-56 sm:w-64 sm:h-64 bg-white border border-[#e4e4e7] animate-pulse flex items-center justify-center text-xs text-[#71717a]">
			Gerando QR Code...
		</div>
	{/if}

	<div class="w-full max-w-sm space-y-2">
		<div class="text-xs text-[#71717a] font-mono break-all px-2 py-1 bg-white border border-[#e4e4e7]">
			{url}
		</div>

		<div class="flex items-center justify-center space-x-3 text-xs uppercase tracking-wider font-medium">
			<button
				type="button"
				onclick={copyLink}
				class="px-4 h-10 border border-[#18181b] bg-white text-[#18181b] hover:bg-[#18181b] hover:text-white transition-colors"
			>
				{copied ? 'Copiado!' : 'Copiar Link'}
			</button>

			{#if qrDataUrl}
				<a
					href={qrDataUrl}
					download="qrcode-vellum-evento.png"
					class="inline-flex items-center px-4 h-10 border border-[#d4d4d8] bg-white text-[#71717a] hover:border-[#18181b] hover:text-[#18181b] transition-colors"
				>
					Baixar Imagem
				</a>
			{/if}
		</div>
	</div>
</div>
