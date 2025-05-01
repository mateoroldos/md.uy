<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onDestroy } from 'svelte';
	import { Check, Copy } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import * as Y from 'yjs';
	import { Y_TEXT_KEY } from '$lib/constants';
	import KeyboardShortcut from './KeyboardShortcut.svelte';
	import { KEYMAP } from '$lib/keymap/keymap';

	let { ydoc } = $props<{
		ydoc: Y.Doc;
	}>();

	let copied = $state(false);
	let timeout: ReturnType<typeof setTimeout>;

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(ydoc.getText(Y_TEXT_KEY).toString());
			copied = true;

			clearTimeout(timeout);
			timeout = setTimeout(() => {
				copied = false;
			}, 800);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	onDestroy(() => {
		clearTimeout(timeout);
	});
</script>

<Button variant="ghost" size="sm" onclick={copyToClipboard} shortcut={KEYMAP['COPY_CONTENT']}>
	{#if copied}
		<div in:fly={{ duration: 300, y: -5 }}>
			<Check class="size-3! text-green-500" />
		</div>
	{:else}
		<div in:fly={{ duration: 300, x: 5 }}>
			<Copy class="size-3! opacity-80" />
		</div>
	{/if}
	<KeyboardShortcut shortcut={KEYMAP['COPY_CONTENT']} />
</Button>
