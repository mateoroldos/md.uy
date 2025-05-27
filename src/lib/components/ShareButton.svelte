<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onDestroy } from 'svelte';
	import { Check, Copy, Share2, Globe, Link, RefreshCw, AlertCircle } from '@lucide/svelte';
	import QrCode from './QrCode.svelte';
	import { fly } from 'svelte/transition';
	import KeyboardShortcut from './KeyboardShortcut.svelte';
	import { KEYMAP } from '$lib/keymap/keymap';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import * as Y from 'yjs';
	import { page } from '$app/state';

	let { isSyncing, toggleSync, ytext } = $props<{
		isSyncing: boolean;
		toggleSync: () => void;
		ytext: Y.Text;
	}>();

	let shared = $state(false);
	let open = $state(false);
	let timeout: ReturnType<typeof setTimeout>;
	let staticShareURL = $state('');
	let activeTab = $state('live');
	let isGeneratingLink = $state(false);
	let staticLinkGenerated = $state(false);
	let staticLinkError = $state<string | null>(null);

	const MAX_NOTE_LENGTH = 2000; // Max length for static sharing

	function openShareDialog() {
		staticShareURL = '';
		staticLinkGenerated = false;
		staticLinkError = null;
		open = true;
	}

	function handleTabChange(newTab: string) {
		activeTab = newTab;

		if (newTab === 'static') {
			staticLinkGenerated = false;
			staticShareURL = '';
			staticLinkError = null;
		}
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

	function generateStaticLink() {
		try {
			isGeneratingLink = true;
			staticLinkError = null;

			const content = ytext.toString();

			if (content.length > MAX_NOTE_LENGTH) {
				staticLinkError =
					'Note is too large for static sharing. Only notes under 2KB are supported.';
				isGeneratingLink = false;
				return;
			}

			// Encode content for URL
			const encodedContent = encodeURIComponent(content);
			staticShareURL = `${window.location.origin}/import?content=${encodedContent}`;
			staticLinkGenerated = true;
			isGeneratingLink = false;
		} catch (error) {
			console.error('Failed to generate static link:', error);
			staticLinkError = 'Failed to generate link';
			isGeneratingLink = false;
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
								<QrCode value={page.url.href} />

								<div class="flex w-full items-center space-x-2">
									<div class="relative grid flex-1 gap-2">
										<Input readonly value={page.url.href} class="w-full pr-10 text-xs" />
										<Button
											variant="ghost"
											size="icon"
											onclick={() => copyToClipboard(page.url.href)}
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
							<span class="mt-1 block text-xs">Only available for notes under 2KB</span>
						</p>
						<Button
							variant="secondary"
							class="mb-2 gap-2"
							onclick={generateStaticLink}
							disabled={isGeneratingLink || staticLinkGenerated}
						>
							<Link class="size-4" />
							{#if isGeneratingLink}
								Generating...
							{:else if staticLinkGenerated}
								Link generated
							{:else}
								Generate static link
							{/if}
						</Button>

						{#if staticLinkError}
							<div class="text-destructive mb-2 flex items-center gap-2">
								<AlertCircle class="size-4" />
								<span class="text-sm">{staticLinkError}</span>
							</div>
						{/if}

						{#if staticLinkGenerated}
							<QrCode value={staticShareURL} />

							<div class="flex w-full items-center space-x-2">
								<div class="relative grid flex-1 gap-2">
									<Input readonly value={staticShareURL} class="w-full pr-10" />
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
						{/if}
					</div>
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</Dialog.Content>
</Dialog.Root>
