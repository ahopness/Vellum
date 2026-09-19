<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatDateTime, getAttendanceWindow } from '$lib/utils/formatters';

	let { data } = $props();
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
								<form
									method="POST"
									action="?/delete"
									class="inline-block"
									use:enhance={({ cancel }) => {
										const ok = confirm(`Excluir permanentemente o evento "${event.title}" e remover todos os dados vinculados?`);
										if (!ok) return cancel();
									}}
								>
									<input type="hidden" name="eventId" value={event.id} />
									<button
										type="submit"
										class="text-red-600 hover:text-red-800 hover:underline underline-offset-2 transition-colors cursor-pointer"
									>
										Excluir
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
