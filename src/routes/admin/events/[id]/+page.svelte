<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatDateTime, formatTime, getAttendanceWindow } from '$lib/utils/formatters';
	import { downloadCertificatePdf, type CertConfig } from '$lib/utils/certificate';
	import QrDisplay from '$lib/components/QrDisplay.svelte';

	let { data } = $props();

	let searchQuery = $state('');
	let isGeneratingTestCert = $state(false);
	let isDeleting = $state(false);
	let showDeleteModal = $state(false);
	let deleteConfirmationInput = $state('');

	const isDeleteConfirmed = $derived(
		deleteConfirmationInput.trim().toUpperCase() === 'EXCLUIR' ||
		Boolean(data.event?.title && deleteConfirmationInput.trim().toLowerCase() === data.event.title.trim().toLowerCase())
	);

	function openDeleteModal() {
		deleteConfirmationInput = '';
		showDeleteModal = true;
	}

	function closeDeleteModal() {
		showDeleteModal = false;
		deleteConfirmationInput = '';
	}

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
	<!-- Cabeçalho do Evento com Fita Editorial, Logo e Ação de Exclusão -->
	<header class="space-y-4 border-b border-[#18181b] pb-6">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<a href="/admin" class="text-xs uppercase font-mono text-[#71717a] hover:text-[#18181b]">
				← Voltar aos Eventos
			</a>

			<div class="flex items-center space-x-4">
				<div class="flex items-center space-x-2">
					<span class="w-3 h-3 rounded-xs" style="background-color: var(--event-theme);"></span>
					<span class="text-xs font-mono text-[#71717a]">Tema: {data.event.theme_color}</span>
				</div>

				<!-- Botão Rápido de Excluir Evento no Topo -->
				<button
					type="button"
					onclick={openDeleteModal}
					class="inline-flex items-center space-x-1.5 px-3 py-1 text-xs uppercase tracking-wider font-mono text-red-700 hover:text-red-900 border border-red-200 hover:border-red-400 bg-red-50/60 transition-colors cursor-pointer"
				>
					<img src="/icons/icon_eraser.png" alt="" class="w-3 h-3 object-contain" />
					<span>Excluir Evento</span>
				</button>
			</div>
		</div>

		<div class="space-y-3">
			<div class="flex items-start space-x-4">
				{#if data.event.logo_url}
					<div class="w-16 h-16 shrink-0 border border-[#e4e4e7] p-1 bg-white flex items-center justify-center">
						<img src={data.event.logo_url} alt="Logo do Evento" class="max-w-full max-h-full object-contain" />
					</div>
				{/if}

				<div class="space-y-1 flex-1">
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
						<div class="flex items-center space-x-1.5 text-sm text-[#52525b]">
							<img src="/icons/icon_building.png" alt="" class="w-4 h-4 object-contain opacity-70" />
							<span>{data.event.description}</span>
						</div>
					{/if}
				</div>
			</div>

			<div class="pt-1 flex items-center space-x-2 text-xs font-mono text-[#71717a]">
				<img src="/icons/icon_calendar.png" alt="" class="w-4 h-4 object-contain opacity-70" />
				<span>Horário: <strong>{formatDateTime(data.event.starts_at)}</strong> até <strong>{formatDateTime(data.event.ends_at)}</strong></span>
			</div>
		</div>
	</header>

	<!-- Seção Dividida: Projeção de QR Code e Ações -->
	<section class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-b border-[#e4e4e7] pb-12">
		<!-- QR Code para Auditório -->
		<div class="space-y-4">
			<div class="space-y-2">
				<div class="flex items-center space-x-2">
					<img src="/icons/icon_building.png" alt="" class="w-4 h-4 object-contain" />
					<h2 class="font-serif text-xl font-medium text-[#18181b]">
						Projeção para o Auditório
					</h2>
				</div>
				<p class="font-sans text-xs text-[#71717a] leading-relaxed">
					Projete este código na tela ou telão. O participante aponta a câmera do celular para abrir o formulário de credenciamento instantâneo.
				</p>
			</div>
			
			<div class="pt-2">
				<QrDisplay url={data.publicUrl} title={data.event.title} />
			</div>
		</div>

		<!-- Ações e Emissão de Teste -->
		<div class="space-y-6 md:border-l md:border-[#e4e4e7] md:pl-8">
			<div class="space-y-2">
				<div class="flex items-center space-x-2">
					<img src="/icons/icon_file.png" alt="" class="w-4 h-4 object-contain" />
					<h2 class="font-serif text-xl font-medium text-[#18181b]">
						Calibragem do Certificado
					</h2>
				</div>
				<p class="font-sans text-xs text-[#71717a] leading-relaxed">
					Faça um teste de emissão no seu navegador para verificar se a tipografia e as coordenadas $(x, y)$ ficaram exatas no template gráfico.
				</p>
			</div>

			<div>
				<button
					type="button"
					onclick={handleTestCertificate}
					disabled={isGeneratingTestCert}
					class="inline-flex items-center justify-center space-x-2 h-11 px-5 border border-[#18181b] bg-white text-xs uppercase tracking-wider font-medium text-[#18181b] hover:bg-[#18181b] hover:text-white transition-colors disabled:opacity-50"
				>
					{#if isGeneratingTestCert}
						<img src="/icons/icon_loading.gif" alt="" class="w-3.5 h-3.5" />
						<span>Gerando Teste...</span>
					{:else}
						<img src="/icons/icon_file.png" alt="" class="w-3.5 h-3.5 object-contain" />
						<span>Baixar Certificado de Teste (.PDF)</span>
					{/if}
				</button>
			</div>

			<hr class="border-t border-[#f4f4f5]" />

			<div class="space-y-2">
				<div class="flex items-center space-x-2">
					<img src="/icons/icon_door.png" alt="" class="w-4 h-4 object-contain" />
					<h2 class="font-serif text-xl font-medium text-[#18181b]">
						Link de Acesso Direto
					</h2>
				</div>
				<p class="font-sans text-xs text-[#71717a] leading-relaxed">
					Caso algum participante não consiga ler o QR Code projetado:
				</p>
				<div class="pt-1">
					<a
						href={data.publicUrl}
						target="_blank"
						rel="noreferrer"
						class="inline-block text-xs font-mono text-blue-700 hover:text-blue-900 underline underline-offset-2 break-all"
					>
						{data.publicUrl} ↗
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Seção da Lista de Presença Minimalista (Design Bible 4.3) -->
	<section class="space-y-6">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div class="space-y-1">
				<div class="flex items-center space-x-2">
					<img src="/icons/icon_people.png" alt="" class="w-5 h-5 object-contain" />
					<h2 class="font-serif text-2xl font-medium text-[#18181b]">
						Lista de Presença
					</h2>
				</div>
				<p class="font-mono text-xs text-[#71717a]">
					{data.attendances.length} {data.attendances.length === 1 ? 'presença confirmada' : 'presenças confirmadas'}
				</p>
			</div>

			<div class="flex items-center space-x-3">
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Filtrar por nome ou e-mail..."
						class="h-10 pl-8 pr-3 border border-[#d4d4d8] text-xs font-sans placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#18181b]"
					/>
					<img src="/icons/icon_search.png" alt="" class="w-3.5 h-3.5 absolute left-2.5 top-3 opacity-50 pointer-events-none" />
				</div>

				<a
					href="/api/export-csv?eventId={data.event.id}"
					class="inline-flex items-center justify-center space-x-1.5 h-10 px-4 text-xs uppercase tracking-wider font-medium font-mono border border-[#18181b] bg-white text-[#18181b] hover:bg-[#18181b] hover:text-white transition-colors whitespace-nowrap"
				>
					<img src="/icons/icon_archive.png" alt="" class="w-3.5 h-3.5 object-contain" />
					<span>Exportar .CSV</span>
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

	<!-- Seção de Encerramento e Exclusão do Evento (Limpeza no D1 e R2) -->
	<section class="pt-8 border-t border-[#e4e4e7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
		<div class="space-y-1">
			<div class="flex items-center space-x-2">
				<img src="/icons/icon_eraser.png" alt="" class="w-4 h-4 object-contain" />
				<h3 class="font-serif text-base font-medium text-red-900">
					Excluir Evento
				</h3>
			</div>
			<p class="text-xs text-[#71717a] font-sans max-w-md">
				Remove definitivamente este evento e toda a lista de presenças, e apaga os arquivos de logo e template vinculados.
			</p>
		</div>

		<button
			type="button"
			onclick={openDeleteModal}
			class="inline-flex items-center space-x-2 h-10 px-4 text-xs uppercase tracking-wider font-medium font-mono text-red-700 border border-red-300 bg-white hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
		>
			<img src="/icons/icon_eraser.png" alt="" class="w-3.5 h-3.5 object-contain" />
			<span>Excluir Permanentemente</span>
		</button>
	</section>
</div>

{#if showDeleteModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181b]/60 backdrop-blur-xs"
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-event-title"
	>
		<!-- Click outside to cancel -->
		<div class="fixed inset-0" onclick={closeDeleteModal} aria-hidden="true"></div>

		<div class="relative w-full max-w-lg bg-[#ffffff] border border-[#18181b] p-6 sm:p-8 shadow-2xl z-10 space-y-6">
			<!-- Header -->
			<div class="border-b border-[#e4e4e7] pb-4 flex items-start justify-between">
				<div>
					<span class="text-[10px] font-mono uppercase tracking-widest text-red-700 font-semibold">
						Zona Crítica • Exclusão de Evento
					</span>
					<h2 id="delete-event-title" class="font-serif text-2xl font-normal text-[#18181b] mt-1">
						Excluir evento
					</h2>
				</div>
				<button
					type="button"
					onclick={closeDeleteModal}
					class="text-[#71717a] hover:text-[#18181b] text-sm p-1 font-mono cursor-pointer"
					aria-label="Fechar"
				>
					✕
				</button>
			</div>

			<!-- Warning details -->
			<div class="space-y-3 text-sm text-[#3f3f46] font-sans leading-relaxed">
				<p class="font-medium text-red-950 bg-red-50 border border-red-200 p-3 text-xs leading-normal">
					<strong>Atenção:</strong> Esta ação é permanente e irreversível. Todos os dados vinculados a este evento serão apagados definitivamente.
				</p>
				<p>
					Ao excluir este evento (<span class="font-mono font-medium text-[#18181b]">{data.event.title}</span>):
				</p>
				<ul class="list-disc pl-5 space-y-1 text-xs text-[#52525b]">
					<li>O evento será excluído do banco de dados (D1).</li>
					<li>Todos os arquivos salvos no armazenamento (R2) vinculados a ele (template de certificado e logotipo) serão removidos permanentemente.</li>
					<li>Todo o histórico de presenças ({data.attendances.length} {data.attendances.length === 1 ? 'registro' : 'registros'}) associado a este evento será apagado.</li>
					<li>A página pública de credenciamento e emissão de certificados deixará de funcionar.</li>
				</ul>
			</div>

			<!-- Form -->
			<form
				method="POST"
				action="?/delete"
				onsubmit={() => (isDeleting = true)}
				class="space-y-4 pt-2 border-t border-[#e4e4e7]"
			>
				<div>
					<label for="event-delete-confirmation" class="block text-xs font-mono uppercase text-[#71717a] mb-1">
						Digite <span class="text-red-700 font-bold">EXCLUIR</span> ou o nome do evento para autorizar:
					</label>
					<input
						id="event-delete-confirmation"
						name="confirmation"
						type="text"
						bind:value={deleteConfirmationInput}
						placeholder="EXCLUIR"
						required
						autocomplete="off"
						class="w-full bg-[#fafafa] border border-[#d4d4d8] px-3 py-2 text-sm font-mono focus:border-red-600 focus:outline-none focus:bg-white transition-colors"
					/>
				</div>

				<div class="flex items-center justify-end space-x-3 pt-2">
					<button
						type="button"
						onclick={closeDeleteModal}
						disabled={isDeleting}
						class="px-4 py-2 border border-[#d4d4d8] text-xs font-mono uppercase tracking-wider text-[#71717a] hover:text-[#18181b] hover:border-[#18181b] transition-colors cursor-pointer disabled:opacity-50"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={!isDeleteConfirmed || isDeleting}
						class="px-4 py-2 bg-red-700 text-white text-xs font-mono uppercase tracking-wider hover:bg-red-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-2"
					>
						{#if isDeleting}
							<span>Excluindo...</span>
						{:else}
							<span>Excluir definitivamente</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
