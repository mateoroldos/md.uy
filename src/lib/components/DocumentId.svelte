<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Check } from '@lucide/svelte';
	import { onDestroy } from 'svelte';
	import { page } from '$app/state';

	let copied = $state(false);
	let timeout: ReturnType<typeof setTimeout>;

	async function copyDocumentId() {
		try {
			await navigator.clipboard.writeText(page.params.id);
			copied = true;

			clearTimeout(timeout);
			timeout = setTimeout(() => {
				copied = false;
			}, 800);
		} catch (err) {
			console.error('Failed to copy document ID:', err);
		}
	}

	onDestroy(() => {
		clearTimeout(timeout);
	});
</script>

<div class="flex items-center gap-1">
	<Check class={`size-3! text-green-500 transition-opacity ${!copied ? 'opacity-0' : ''}`} />
	<Button variant="ghost" size="sm" onclick={copyDocumentId}>
		<span class="opacity-40">Document ID:</span>
		<span class="font-mono text-xs">{page.params.id}</span>
	</Button>
</div>
