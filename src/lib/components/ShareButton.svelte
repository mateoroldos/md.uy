<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onDestroy } from 'svelte';
	import { Check, Share2 } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import KeyboardShortcut from './KeyboardShortcut.svelte';
	import { KEYMAP } from '$lib/keymap/keymap';

	let shared = $state(false);
	let timeout: ReturnType<typeof setTimeout>;

	async function shareURL() {
		try {
			const currentURL = window.location.href;

			// Try to use the Share API if available
			if (navigator.share) {
				await navigator.share({
					title: 'Collaborative Markdown Editor',
					url: currentURL
				});
				shared = true;
			} else {
				// Fallback to copying to clipboard
				await navigator.clipboard.writeText(currentURL);
				shared = true;
			}

			clearTimeout(timeout);
			timeout = setTimeout(() => {
				shared = false;
			}, 800);
		} catch (err) {
			console.error('Failed to share:', err);
		}
	}

	onDestroy(() => {
		clearTimeout(timeout);
	});
</script>

<Button variant="ghost" size="sm" onclick={shareURL} shortcut={KEYMAP['COPY_URL']}>
	{#if shared}
		<div in:fly={{ duration: 300, y: -5 }}>
			<Check class="size-3! text-green-500" />
		</div>
	{:else}
		<div in:fly={{ duration: 300, x: 5 }}>
			<Share2 class="size-3! opacity-80" />
		</div>
	{/if}
	<KeyboardShortcut shortcut={KEYMAP['COPY_URL']} />
</Button>
