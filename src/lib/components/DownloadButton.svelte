<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onDestroy } from 'svelte';
	import { Check, Download } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import * as Y from 'yjs';
	import { Y_TEXT_KEY } from '$lib/constants';
	import KeyboardShortcut from './KeyboardShortcut.svelte';
	import { KEYMAP } from '$lib/keymap/keymap';

	let { ydoc } = $props<{
		ydoc: Y.Doc;
	}>();

	let downloaded = $state(false);
	let timeout: ReturnType<typeof setTimeout>;

	function downloadAsFile() {
		try {
			const content = ydoc.getText(Y_TEXT_KEY).toString();
			const blob = new Blob([content], { type: 'text/markdown' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'document.md';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			
			downloaded = true;

			clearTimeout(timeout);
			timeout = setTimeout(() => {
				downloaded = false;
			}, 800);
		} catch (err) {
			console.error('Failed to download:', err);
		}
	}

	onDestroy(() => {
		clearTimeout(timeout);
	});
</script>

<Button variant="ghost" size="sm" onclick={downloadAsFile} shortcut={KEYMAP['DOWNLOAD_CONTENT']}>
	{#if downloaded}
		<div in:fly={{ duration: 300, y: -5 }}>
			<Check class="size-3! text-green-500" />
		</div>
	{:else}
		<div in:fly={{ duration: 300, x: 5 }}>
			<Download class="size-3! opacity-80" />
		</div>
	{/if}
	<KeyboardShortcut shortcut={KEYMAP['DOWNLOAD_CONTENT']} />
</Button>