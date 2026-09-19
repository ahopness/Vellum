<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props {
		label: string;
		type?: HTMLInputAttributes['type'];
		name: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		autocapitalize?: HTMLInputAttributes['autocapitalize'];
		inputmode?: HTMLInputAttributes['inputmode'];
		pattern?: string;
		disabled?: boolean;
		helperText?: string;
		error?: string;
		oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
	}

	let {
		label,
		type = 'text',
		name,
		value = $bindable(''),
		placeholder = '',
		required = false,
		autocomplete,
		autocapitalize,
		inputmode,
		pattern,
		disabled = false,
		helperText,
		error,
		oninput
	}: Props = $props();
</script>

<div class="space-y-1.5 w-full">
	<label for={name} class="block text-xs uppercase tracking-wider text-[#71717a] font-sans font-medium">
		{label}
		{#if required}
			<span class="text-neutral-400 ml-0.5">*</span>
		{/if}
	</label>

	<input
		id={name}
		{name}
		{type}
		bind:value
		{placeholder}
		{required}
		{autocomplete}
		{autocapitalize}
		{inputmode}
		{pattern}
		{disabled}
		{oninput}
		class="w-full h-12 bg-white px-3 border rounded-none font-sans text-base text-[#18181b] placeholder:text-[#a1a1aa] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--event-theme,#18181b)] {error
			? 'border-red-500'
			: 'border-[#d4d4d8] hover:border-[#a1a1aa] focus:border-[var(--event-theme,#18181b)]'}"
	/>

	{#if error}
		<p class="text-xs text-red-600 font-sans tracking-tight">{error}</p>
	{:else if helperText}
		<p class="text-xs text-[#71717a] font-sans leading-relaxed">{helperText}</p>
	{/if}
</div>
