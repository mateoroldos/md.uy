<script lang="ts">
	import Preview from '$lib/components/Preview.svelte';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import { initYjs } from '$lib/editor/initYjs';
	import Editor from '$lib/components/Editor.svelte';
	import { ActiveUser } from '$lib/stores/active-user.svelte';
	import ConnectedUsers from '$lib/components/ConnectedUsers.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import DocumentId from '$lib/components/DocumentId.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import EditorModeToggle from '$lib/components/EditorModeToggle.svelte';
	import type { EditorMode } from '$lib/types';
	import Profile from '$lib/components/Profile.svelte';

	let isEmpty = $state(true);
	let viewMode = $state<EditorMode>('edit');

	const { ydoc, provider, persistance, ytext } = initYjs(page.params.id);
	const activeUser = new ActiveUser('Anonymus', provider);

	ytext.observe(() => {
		isEmpty = !ytext.length;
	});

	onDestroy(() => {
		if (ydoc) {
			ydoc.destroy();
		}
		if (provider) {
			provider.destroy();
		}
		if (persistance) {
			persistance.destroy();
		}
	});
</script>

<div
	class="container mx-auto flex min-h-screen flex-col overflow-hidden p-4 md:grid md:grid-cols-[1fr_minmax(auto,90ch)_1fr] md:gap-8 lg:gap-12"
>
	<div class="col-start-2 grid grid-rows-[auto_1fr] gap-3 overflow-hidden">
		<div class="flex flex-row items-center justify-between gap-8">
			<EditorModeToggle bind:viewMode />
			<DocumentId />
			<div class="flex flex-row items-center gap-2">
				<ShareButton />
				<CopyButton {ydoc} />
			</div>
		</div>
		<div class="flex flex-col items-start gap-4 overflow-hidden rounded">
			<div
				class="relative h-full w-full overflow-hidden focus:outline-none"
				class:hidden={viewMode !== 'edit'}
			>
				{#if isEmpty}
					<span class="text-foreground/40 absolute top-6 left-4 z-10 font-mono text-sm sm:left-11"
						>Start typing to add content...</span
					>
				{/if}
				<Editor {provider} {ytext} isVisible={viewMode === 'edit'} />
			</div>
			<div
				class="bg-card relative h-full w-full overflow-hidden rounded"
				class:hidden={viewMode !== 'preview'}
			>
				{#if isEmpty}
					<div class="text-foreground/40 absolute top-5.5 left-4 z-10 sm:left-11">
						No content to preview yet
					</div>
				{/if}
				<Preview {ytext} />
			</div>
		</div>
	</div>
	<div class="order-first mt-0.5 mb-4 space-y-4 md:order-last md:col-start-3 md:space-y-8">
		<Profile {activeUser} />
		<ConnectedUsers {provider} {activeUser} />
	</div>
</div>
