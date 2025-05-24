<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onDestroy } from 'svelte';
	import { Check, Copy, QrCode as QrCodeIcon, Share2 } from '@lucide/svelte';
	import QrCode from './QrCode.svelte';
	import { fly } from 'svelte/transition';
	import KeyboardShortcut from './KeyboardShortcut.svelte';
	import { KEYMAP } from '$lib/keymap/keymap';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';

	let shared = $state(false);
	let open = $state(false);
	let timeout: ReturnType<typeof setTimeout>;
	let currentURL = $state('');

	function openShareDialog() {
		currentURL = window.location.href;
		open = true;
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(currentURL);
			shared = true;

			clearTimeout(timeout);
			timeout = setTimeout(() => {
				shared = false;
			}, 800);
		} catch (err) {
			console.error('Failed to copy URL:', err);
		}
	}

	onDestroy(() => {
		clearTimeout(timeout);
	});
</script>

<Button
	variant="outline"
	size="sm"
	onclick={openShareDialog}
	shortcut={KEYMAP['COPY_URL']}
	class="ml-3"
>
	<div in:fly={{ duration: 300, x: 5 }}>
		<Share2 class="size-3! opacity-80" />
	</div>
	Share
	<KeyboardShortcut shortcut={KEYMAP['COPY_URL']} />
</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Share</Dialog.Title>
			<Dialog.Description>
				Share this page with others by scanning the QR code or copying the URL.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col items-center space-y-4 py-4">
			<QrCode value={currentURL} />
		</div>

		<div class="flex items-center space-x-2">
			<div class="relative grid flex-1 gap-2">
				<Input readonly value={currentURL} class="w-full pr-10" />
				<Button
					variant="ghost"
					size="icon"
					onclick={copyToClipboard}
					title="Copy to clipboard"
					class="absolute top-1/2 right-1.5 -translate-y-1/2 transform"
				>
					{#if shared}
						<div in:fly={{ duration: 300, y: -5 }}>
							<Check class="size-3! text-green-500" />
						</div>
					{:else}
						<div in:fly={{ duration: 300, x: 5 }}>
							<Copy class="size-3!" />
						</div>
					{/if}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
