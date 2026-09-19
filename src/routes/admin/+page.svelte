<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatDateTime, getAttendanceWindow } from '$lib/utils/formatters';

	let { data } = $props();

	let eventToDelete = $state<any>(null);
	let deleteConfirmationInput = $state('');
	let isDeleting = $state(false);

	let isDeleteConfirmed = $derived(
		deleteConfirmationInput.trim().toUpperCase() === 'EXCLUIR' ||
		Boolean(eventToDelete?.title && deleteConfirmationInput.trim().toLowerCase() === eventToDelete.title.trim().toLowerCase())
	);

	function openDeleteModal(ev: any) {
		eventToDelete = ev;
		deleteConfirmationInput = '';
	}

	function closeDeleteModal() {
		eventToDelete = null;
		deleteConfirmationInput = '';
	}
</script>

<div class="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 space-y-10">
	<!-- Top Bar Editorial -->
	<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#18181b] pb-6">
		<div class="space-y-1">
			<div class="flex items-center space-x-2">
				<img src="/icons/icon_desk.png" alt="" class="w-4 h-4 object-contain" />
				<span class="text-xs uppercase tracking-widest font-mono text-[#71717a]">
					Painel de Controle
				</span>
			</div>
			<h1 class="font-serif text-3xl sm:text-4xl font-semibold text-[#18181b]">
				Eventos Publicados
			</h1>
			<p class="font-sans text-sm text-[#71717a]">
				{data.events.length} {data.events.length === 1 ? 'evento cadastrado' : 'eventos cadastrados'}
			</p>
		</div>

		<div>
			<a
				href="/admin/events/new"
				class="inline-flex items-center justify-center space-x-2 h-12 px-6 bg-[#18181b] text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors"
			>
				<img src="/icons/icon_pen.png" alt="" class="w-3.5 h-3.5 object-contain invert brightness-0" />
				<span>Novo Evento</span>
			</a>
		</div>
	</div>

	<!-- Lista em Tabela Aberta (Filosofia Anti-Card) -->
	{#if data.events.length === 0}
		<div class="py-16 text-center space-y-4 border-b border-[#e4e4e7]">
			<img src="/icons/icon_archive.png" alt="" class="w-8 h-8 object-contain mx-auto opacity-40" />
			<p class="font-serif text-2xl text-[#71717a] italic">
				Nenhum evento registrado até o momento.
			</p>
			<p class="font-sans text-sm text-[#a1a1aa] max-w-md mx-auto">
				Crie seu primeiro evento acadêmico ou corporativo para gerar a folha de presença e o modelo de certificado.
			</p>
			<div class="pt-4">
				<a
					href="/admin/events/new"
					class="inline-flex items-center justify-center space-x-2 h-11 px-5 border border-[#18181b] text-xs uppercase tracking-wider font-medium text-[#18181b] hover:bg-[#18181b] hover:text-white transition-colors"
				>
					<img src="/icons/icon_pen.png" alt="" class="w-3.5 h-3.5 object-contain" />
					<span>Cadastrar Primeiro Evento</span>
				</a>
			</div>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b-2 border-[#18181b] text-[11px] uppercase tracking-wider font-mono text-[#71717a]">
						<th class="py-3 pr-4 font-medium">Evento & Logo</th>
						<th class="py-3 px-4 font-medium">
							<span class="inline-flex items-center space-x-1">
								<img src="/icons/icon_calendar.png" alt="" class="w-3.5 h-3.5 object-contain opacity-70" />
								<span>Período</span>
							</span>
						</th>
						<th class="py-3 px-4 font-medium">Status</th>
						<th class="py-3 px-4 font-medium text-center">
							<span class="inline-flex items-center space-x-1 justify-center">
								<img src="/icons/icon_people.png" alt="" class="w-3.5 h-3.5 object-contain opacity-70" />
								<span>Presenças</span>
							</span>
						</th>
						<th class="py-3 pl-4 font-medium text-right">Ações</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-[#e4e4e7] font-sans text-sm">
					{#each data.events as event}
						{@const window = getAttendanceWindow(event.starts_at, event.ends_at)}
						<tr class="hover:bg-neutral-50/60 transition-colors group">
							<!-- Nome, Logo e Tema -->
							<td class="py-4 pr-4">
								<div class="flex items-center space-x-3">
									{#if event.logo_url}
										<img
											src={event.logo_url}
											alt="Logo"
											class="w-8 h-8 object-contain border border-[#e4e4e7] p-0.5 bg-white shrink-0"
										/>
									{:else}
										<div
											class="w-3.5 h-3.5 shrink-0 rounded-xs"
											style="background-color: {event.theme_color};"
											title="Cor Temática: {event.theme_color}"
										></div>
									{/if}
									<div>
										<a
											href="/admin/events/{event.id}"
											class="font-serif text-base font-medium text-[#18181b] group-hover:underline underline-offset-2"
										>
											{event.title}
										</a>
										{#if event.description}
											<p class="text-xs text-[#71717a] line-clamp-1 max-w-xs sm:max-w-md">
												{event.description}
											</p>
										{/if}
									</div>
								</div>
							</td>

							<!-- Período -->
							<td class="py-4 px-4 font-mono text-xs text-[#52525b] whitespace-nowrap">
								<div>{formatDateTime(event.starts_at)}</div>
								<div class="text-[#a1a1aa] text-[11px]">até {formatDateTime(event.ends_at)}</div>
							</td>

							<!-- Status -->
							<td class="py-4 px-4 whitespace-nowrap">
								{#if window.canCheckIn}
									<span class="inline-flex items-center px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-300">
										● Em Credenciamento
									</span>
								{:else if window.isUpcoming}
									<span class="inline-flex items-center px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-300">
										Agendado
									</span>
								{:else}
									<span class="inline-flex items-center px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-neutral-600 bg-neutral-100 border border-neutral-300">
										Encerrado
									</span>
								{/if}
							</td>

							<!-- Presenças -->
							<td class="py-4 px-4 text-center font-mono font-medium text-sm text-[#18181b] whitespace-nowrap">
								{event.attendeesCount}
							</td>

							<!-- Ações -->
							<td class="py-4 pl-4 text-right whitespace-nowrap space-x-2.5 text-xs uppercase tracking-wider font-mono">
								<a
									href="/admin/events/{event.id}"
									class="text-[#18181b] hover:underline underline-offset-2 font-medium"
								>
									Gerenciar
								</a>
								<span class="text-[#d4d4d8]">|</span>
								<a
									href="/e/{event.id}"
									target="_blank"
									rel="noreferrer"
									class="text-[#71717a] hover:text-[#18181b] hover:underline underline-offset-2"
								>
									Página Pública ↗
								</a>
								<span class="text-[#d4d4d8]">|</span>
								<button
									type="button"
									onclick={() => openDeleteModal(event)}
									class="text-red-600 hover:text-red-800 hover:underline underline-offset-2 transition-colors cursor-pointer"
								>
									Excluir
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

{#if eventToDelete}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181b]/60 backdrop-blur-xs"
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-event-list-title"
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
					<h2 id="delete-event-list-title" class="font-serif text-2xl font-normal text-[#18181b] mt-1">
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
					Ao excluir o evento (<span class="font-mono font-medium text-[#18181b]">{eventToDelete.title}</span>):
				</p>
				<ul class="list-disc pl-5 space-y-1 text-xs text-[#52525b]">
					<li>O evento será excluído do banco de dados (D1).</li>
					<li>Todos os arquivos salvos no armazenamento (R2) vinculados a ele (template de certificado e logotipo) serão removidos permanentemente.</li>
					<li>Todo o histórico de presenças associado a este evento será apagado.</li>
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
				<input type="hidden" name="eventId" value={eventToDelete.id} />
				<div>
					<label for="event-list-delete-confirmation" class="block text-xs font-mono uppercase text-[#71717a] mb-1">
						Digite <span class="text-red-700 font-bold">EXCLUIR</span> ou o nome do evento para autorizar:
					</label>
					<input
						id="event-list-delete-confirmation"
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
