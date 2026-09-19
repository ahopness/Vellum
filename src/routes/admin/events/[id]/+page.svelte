<script lang="ts">
	import { formatDateTime, formatTime, getAttendanceWindow } from '$lib/utils/formatters';
	import { downloadCertificatePdf, type CertConfig } from '$lib/utils/certificate';
	import QrDisplay from '$lib/components/QrDisplay.svelte';

	let { data } = $props();

	let searchQuery = $state('');
	let isGeneratingTestCert = $state(false);

	const windowStatus = $derived(getAttendanceWindow(data.event.starts_at, data.event.ends_at));

	const filteredAttendances = $derived(
		data.attendances.filter((att) => {
			if (!searchQuery.trim()) return true;
			const query = searchQuery.toLowerCase();
			return (
				att.participant_name.toLowerCase().includes(query) ||
				att.participant_email.toLowerCase().includes(query)
			);
		})
	);

	async function handleTestCertificate() {
		try {
			isGeneratingTestCert = true;
			const certConfig: CertConfig = JSON.parse(data.event.cert_config);
			await downloadCertificatePdf({
				templateUrlOrData: data.event.cert_template_url || undefined,
				config: certConfig,
				participantName: 'Exemplo de Nome Acadêmico',
				participantCpf: '123.456.789-00',
				eventTitle: data.event.title
			});
		} catch (err) {
			console.error('Falha ao gerar certificado de teste:', err);
			alert('Não foi possível gerar a prévia do certificado.');
		} finally {
			isGeneratingTestCert = false;
		}
	}
</script>

<div
	class="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 space-y-12"
	style="--event-theme: {data.event.theme_color};"
>
	<!-- Cabeçalho do Evento com Fita Editorial -->
	<header class="space-y-4 border-b border-[#18181b] pb-6">
		<div class="flex items-center justify-between">
			<a href="/admin" class="text-xs uppercase font-mono text-[#71717a] hover:text-[#18181b]">
				← Voltar aos Eventos
			</a>

			<div class="flex items-center space-x-2">
				<span class="w-2.5 h-2.5 rounded-full" style="background-color: var(--event-theme);"></span>
				<span class="text-xs font-mono text-[#71717a]">Tema: {data.event.theme_color}</span>
			</div>
		</div>

		<div class="space-y-2">
			<div class="flex flex-wrap items-center gap-3">
				<h1 class="font-serif text-3xl sm:text-4xl font-semibold text-[#18181b]">
					{data.event.title}
				</h1>

				{#if windowStatus.canCheckIn}
					<span class="inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-300">
						● Credenciamento Aberto
					</span>
				{:else if windowStatus.isUpcoming}
					<span class="inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-300">
						Agendado
					</span>
				{:else}
					<span class="inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider text-neutral-600 bg-neutral-100 border border-neutral-300">
						Encerrado
					</span>
				{/if}
			</div>

			{#if data.event.description}
				<p class="font-sans text-sm text-[#52525b] max-w-2xl leading-relaxed">
					{data.event.description}
				</p>
			{/if}

			<div class="pt-1 text-xs font-mono text-[#71717a]">
				Horário: <strong>{formatDateTime(data.event.starts_at)}</strong> até <strong>{formatDateTime(data.event.ends_at)}</strong>
			</div>
		</div>
	</header>

	<!-- Seção Dividida: Projeção de QR Code e Ações -->
	<section class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-b border-[#e4e4e7] pb-12">
		<!-- QR Code para Auditório -->
		<div class="space-y-4">
			<h2 class="font-serif text-xl font-medium text-[#18181b]">
				Projeção para o Auditório
			</h2>
			<p class="font-sans text-xs text-[#71717a] leading-relaxed">
				Projete este código na tela ou telão. O participante aponta a câmera do celular para abrir o formulário de credenciamento.
			</p>
			
			<div class="pt-2">
				<QrDisplay url={data.publicUrl} title={data.event.title} />
			</div>
		</div>

		<!-- Ações e Emissão de Teste -->
		<div class="space-y-6 md:border-l md:border-[#e4e4e7] md:pl-8">
			<div class="space-y-2">
				<h2 class="font-serif text-xl font-medium text-[#18181b]">
					Calibragem do Certificado
				</h2>
				<p class="font-sans text-xs text-[#71717a] leading-relaxed">
					Faça um teste de emissão no seu navegador para verificar se a tipografia e as coordenadas $(x, y)$ ficaram exatas no template gráfico.
				</p>
			</div>

			<div>
				<button
					type="button"
					onclick={handleTestCertificate}
					disabled={isGeneratingTestCert}
					class="inline-flex items-center justify-center h-11 px-5 border border-[#18181b] bg-white text-xs uppercase tracking-wider font-medium text-[#18181b] hover:bg-[#18181b] hover:text-white transition-colors disabled:opacity-50"
				>
					<span>{isGeneratingTestCert ? 'Gerando Teste...' : 'Baixar Certificado de Teste (.PDF)'}</span>
				</button>
			</div>

			<hr class="border-t border-[#f4f4f5]" />

			<div class="space-y-2">
				<span class="text-xs uppercase tracking-wider font-mono text-[#71717a]">
					Link de Acesso Direto
				</span>
				<p class="text-xs text-[#71717a]">
					Caso algum participante não consiga ler o QR Code:
				</p>
				<a
					href={data.publicUrl}
					target="_blank"
					rel="noreferrer"
					class="inline-block text-xs font-mono text-blue-700 underline underline-offset-2 break-all"
				>
					{data.publicUrl} ↗
				</a>
			</div>
		</div>
	</section>

	<!-- Seção da Lista de Presença Minimalista (Design Bible 4.3) -->
	<section class="space-y-6">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div class="space-y-1">
				<h2 class="font-serif text-2xl font-medium text-[#18181b]">
					Lista de Presença
				</h2>
				<p class="font-mono text-xs text-[#71717a]">
					{data.attendances.length} {data.attendances.length === 1 ? 'presença confirmada' : 'presenças confirmadas'}
				</p>
			</div>

			<div class="flex items-center space-x-3">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Filtrar por nome ou e-mail..."
					class="h-10 px-3 border border-[#d4d4d8] text-xs font-sans placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#18181b]"
				/>

				<a
					href="/api/export-csv?eventId={data.event.id}"
					class="inline-flex items-center justify-center h-10 px-4 text-xs uppercase tracking-wider font-medium font-mono border border-[#18181b] bg-white text-[#18181b] hover:bg-[#18181b] hover:text-white transition-colors whitespace-nowrap"
				>
					Exportar .CSV
				</a>
			</div>
		</div>

		<!-- Tabela Aberta sem Cards -->
		{#if data.attendances.length === 0}
			<div class="py-12 text-center space-y-2 border-y border-[#e4e4e7]">
				<p class="font-serif text-lg text-[#71717a] italic">
					Nenhuma presença registrada ainda.
				</p>
				<p class="font-sans text-xs text-[#a1a1aa]">
					Os participantes aparecerão nesta tabela em tempo real conforme realizarem o check-in pelo QR Code.
				</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="border-b-2 border-[#18181b] text-[11px] uppercase tracking-wider font-mono text-[#71717a]">
							<th class="py-2.5 pr-4 font-medium">Nome do Participante</th>
							<th class="py-2.5 px-4 font-medium">E-mail</th>
							<th class="py-2.5 pl-4 font-medium text-right">Horário</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[#e4e4e7] font-sans text-sm">
						{#each filteredAttendances as attendance}
							<tr class="hover:bg-neutral-50/60 transition-colors">
								<td class="py-3 pr-4 font-medium text-[#18181b]">
									{attendance.participant_name}
								</td>
								<td class="py-3 px-4 font-mono text-xs text-[#52525b]">
									{attendance.participant_email}
								</td>
								<td class="py-3 pl-4 font-mono text-xs text-[#71717a] text-right whitespace-nowrap">
									{formatTime(attendance.checked_in_at)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>
