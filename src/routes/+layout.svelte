<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';

	let { data, children } = $props();

	let showDeleteModal = $state(false);
	let confirmationInput = $state('');
	let isSubmitting = $state(false);

	let isConfirmed = $derived(
		confirmationInput.trim().toUpperCase() === 'EXCLUIR' ||
		Boolean(data.admin?.email && confirmationInput.trim().toLowerCase() === data.admin.email.toLowerCase())
	);

	function openDeleteModal() {
		confirmationInput = '';
		showDeleteModal = true;
	}

	function closeDeleteModal() {
		showDeleteModal = false;
		confirmationInput = '';
	}
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
			</div>

			<div class="flex items-center space-x-6">
				<a href="/politica-de-privacidade" class="hover:text-[#18181b] transition-colors underline underline-offset-4 decoration-[#d4d4d8]">
					Política de Privacidade
				</a>

				{#if data.admin}
					<button
						type="button"
						onclick={openDeleteModal}
						class="text-red-700 hover:text-red-900 transition-colors underline underline-offset-4 decoration-red-200 cursor-pointer font-sans"
					>
						Excluir conta
					</button>
				{:else}
					<a
						href="/admin/login"
						class="text-[#a1a1aa] hover:text-red-700 transition-colors underline underline-offset-4 decoration-[#e4e4e7]"
						title="Faça login como organizador para gerenciar ou excluir sua conta"
					>
						Excluir conta
					</a>
				{/if}
			</div>
		</div>
	</footer>
</div>

{#if showDeleteModal && data.admin}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181b]/60 backdrop-blur-xs"
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-account-title"
	>
		<!-- Click outside to cancel -->
		<div class="fixed inset-0" onclick={closeDeleteModal} aria-hidden="true"></div>

		<div class="relative w-full max-w-lg bg-[#ffffff] border border-[#18181b] p-6 sm:p-8 shadow-2xl z-10 space-y-6">
			<!-- Header -->
			<div class="border-b border-[#e4e4e7] pb-4 flex items-start justify-between">
				<div>
					<span class="text-[10px] font-mono uppercase tracking-widest text-red-700 font-semibold">
						Zona Crítica • Exclusão de Dados
					</span>
					<h2 id="delete-account-title" class="font-serif text-2xl font-normal text-[#18181b] mt-1">
						Excluir conta de organizador
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
					<strong>Atenção:</strong> Esta ação é permanente e irreversível. Todos os seus dados serão apagados definitivamente.
				</p>
				<p>
					Ao excluir sua conta (<span class="font-mono font-medium text-[#18181b]">{data.admin.email}</span>):
				</p>
				<ul class="list-disc pl-5 space-y-1 text-xs text-[#52525b]">
					<li>Todos os eventos criados por você serão excluídos do banco de dados (D1).</li>
					<li>Todos os logotipos e modelos de certificados salvos no armazenamento (R2) serão deletados.</li>
					<li>Todo o histórico de presenças e credenciamentos associados aos seus eventos será removido.</li>
					<li>Seus links de acesso e dados cadastrais serão permanentemente apagados.</li>
				</ul>
			</div>

			<!-- Form -->
			<form
				method="POST"
				action="/admin/account/delete"
				onsubmit={() => (isSubmitting = true)}
				class="space-y-4 pt-2 border-t border-[#e4e4e7]"
			>
				<div>
					<label for="confirmation" class="block text-xs font-mono uppercase text-[#71717a] mb-1">
						Digite <span class="text-red-700 font-bold">EXCLUIR</span> ou seu e-mail para autorizar:
					</label>
					<input
						id="confirmation"
						name="confirmation"
						type="text"
						bind:value={confirmationInput}
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
						disabled={isSubmitting}
						class="px-4 py-2 border border-[#d4d4d8] text-xs font-mono uppercase tracking-wider text-[#71717a] hover:text-[#18181b] hover:border-[#18181b] transition-colors cursor-pointer disabled:opacity-50"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={!isConfirmed || isSubmitting}
						class="px-4 py-2 bg-red-700 text-white text-xs font-mono uppercase tracking-wider hover:bg-red-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-2"
					>
						{#if isSubmitting}
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
