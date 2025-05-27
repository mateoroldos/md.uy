<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onDestroy } from 'svelte';
	import { Check, Copy, Share2, Globe, Link, RefreshCw } from '@lucide/svelte';
	import QrCode from './QrCode.svelte';
	import { fly } from 'svelte/transition';
	import KeyboardShortcut from './KeyboardShortcut.svelte';
	import { KEYMAP } from '$lib/keymap/keymap';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';

	let { isSyncing, toggleSync } = $props<{
		isSyncing: boolean;
		toggleSync: () => void;
	}>();

	let shared = $state(false);
	let open = $state(false);
	let timeout: ReturnType<typeof setTimeout>;
	let currentURL = $state('');
	let staticShareURL = $state('');
	let activeTab = $state('live');

	function openShareDialog() {
		currentURL = window.location.href;
		staticShareURL = window.location.href + '?static=true'; // Placeholder for static share URL
		open = true;
	}

	function handleTabChange(newTab: string) {
		activeTab = newTab;
	}

	async function copyToClipboard(url: string) {
		try {
			await navigator.clipboard.writeText(url);
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
	class="relative ml-3"
>
	<div in:fly={{ duration: 300, x: 5 }}>
		<Share2 class="size-3! opacity-80" />
	</div>
	Share
	{#if isSyncing}
		<span class="absolute -top-1 -right-1 flex size-2">
			<span
				class="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
			></span>
			<span class="bg-primary relative inline-flex size-2 rounded-full"></span>
		</span>
	{/if}
	<KeyboardShortcut shortcut={KEYMAP['COPY_URL']} />
</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Share</Dialog.Title>
			<Dialog.Description>Choose how you want to share your note</Dialog.Description>
		</Dialog.Header>

		<Tabs.Root value={activeTab} onValueChange={handleTabChange}>
			<Tabs.List class="grid w-full grid-cols-2 gap-1">
				<Tabs.Trigger value="live" class="flex items-center gap-2">
					<div class="relative">
						<Globe class="size-4" />
						{#if isSyncing}
							<span class="absolute -top-0.5 -right-0.5 flex size-2">
								<span
									class="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
								></span>
								<span class="bg-primary relative inline-flex size-2 rounded-full"></span>
							</span>
						{/if}
					</div>
					Live Sync
				</Tabs.Trigger>
				<Tabs.Trigger value="static" class="flex items-center gap-2">
					<Link class="size-4" /> Static
				</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="live" class="py-4">
				<div class="space-y-4">
					<div class="flex flex-col items-center space-y-4">
						<div class="flex flex-col items-center gap-2">
							{#if isSyncing}
								<div class="mb-2 flex items-center gap-2">
									<span class="text-sm font-medium">Live sync is active</span>
									<Button variant="outline" size="sm" onclick={toggleSync} class="ml-2">
										Turn off
									</Button>
								</div>
								<p class="text-muted-foreground mt-2 text-center text-sm">
									Anyone with this link can view and edit this note in real-time. All changes sync
									automatically between devices.
								</p>
								<QrCode value={currentURL} />

								<div class="flex w-full items-center space-x-2">
									<div class="relative grid flex-1 gap-2">
										<Input readonly value={currentURL} class="w-full pr-10 text-xs" />
										<Button
											variant="ghost"
											size="icon"
											onclick={() => copyToClipboard(currentURL)}
											title="Copy to clipboard"
											class="absolute top-1/2 right-1.5 -translate-y-1/2 transform"
										>
											{#if shared}
												<div in:fly={{ duration: 300, y: -5 }}>
													<Check class="size-3 text-green-500" />
												</div>
											{:else}
												<div in:fly={{ duration: 300, x: 5 }}>
													<Copy class="size-3" />
												</div>
											{/if}
										</Button>
									</div>
								</div>
							{:else}
								<div class="text-center">
									<p class="text-muted-foreground mb-3 text-sm">
										Enable live sync to collaborate in real-time with anyone who has the link.
									</p>
									<Button onclick={toggleSync} class="gap-2">
										<RefreshCw class="size-4" />
										Start live sync
									</Button>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</Tabs.Content>

			<Tabs.Content value="static" class="py-4">
				<div class="space-y-4">
					<div class="flex flex-col items-center space-y-4">
						<p class="text-muted-foreground text-center text-sm">
							Share a static version of this note. Anyone with this link can copy the note to their
							own md.uy instance. Changes won't sync between different copies.
						</p>

						<QrCode value={staticShareURL} />

						<div class="flex w-full items-center space-x-2">
							<div class="relative grid flex-1 gap-2">
								<Input readonly value={staticShareURL} class="w-full pr-10 text-xs" />
								<Button
									variant="ghost"
									size="icon"
									onclick={() => copyToClipboard(staticShareURL)}
									title="Copy to clipboard"
									class="absolute top-1/2 right-1.5 -translate-y-1/2 transform"
								>
									{#if shared}
										<div in:fly={{ duration: 300, y: -5 }}>
											<Check class="size-3 text-green-500" />
										</div>
									{:else}
										<div in:fly={{ duration: 300, x: 5 }}>
											<Copy class="size-3" />
										</div>
									{/if}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</Dialog.Content>
</Dialog.Root>
