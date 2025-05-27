<script lang="ts">
	import Preview from '$lib/components/Preview.svelte';
	import { page } from '$app/state';
	import { onDestroy, onMount } from 'svelte';
	import Editor from '$lib/components/Editor.svelte';
	import Presentation from '$lib/components/Presentation.svelte';
	import { ActiveUser } from '$lib/stores/active-user.svelte';
	import ConnectedUsers from '$lib/components/ConnectedUsers.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import DownloadButton from '$lib/components/DownloadButton.svelte';
	import EditorModeToggle from '$lib/components/EditorModeToggle.svelte';
	import type { EditorMode } from '$lib/types';
	import Profile from '$lib/components/Profile.svelte';
	import { db } from '$lib/db';
	import debounce from 'debounce';
	import { updateLastEdited, updateTitle } from '$lib/actions/notes-actions';
	import type { PageProps } from './$types';
	import { WebrtcSync } from '$lib/stores/webrtc-sync.svelte';

	let viewMode = $state<EditorMode>('edit');

	let { data }: PageProps = $props();

	// const activeUser = new ActiveUser('Anonymus', data.provider);
	const webrtcSync = new WebrtcSync(page.params.id, data.ydoc);

	onMount(() => {
		const importKey = `import-${page.params.id}`;
		const importedContent = sessionStorage.getItem(importKey);

		if (importedContent) {
			data.ytext.insert(0, importedContent);
			sessionStorage.removeItem(importKey);
		}
	});

	data.ytext.observe(
		// Read the note to find changes in the main title + update last edited
		debounce(() => {
			const lines = data.ytext.toString().split('\n');
			const headingLine = lines.find((line) => line.startsWith('# '));

			if (headingLine) {
				updateTitle(page.params.id, headingLine.substring(2), db);

				return;
			}

			updateLastEdited(page.params.id, db);
		}, 500)
	);

	let currentId = $state<string>(page.params.id);

	$effect(() => {
		const newId = page.params.id;
		if (newId !== currentId) {
			data.cleanup();
			if (webrtcSync.provider) {
				webrtcSync.provider.destroy();
			}
			currentId = newId;
		}
	});

	onDestroy(() => {
		data.cleanup();
		if (webrtcSync.provider) {
			webrtcSync.provider.destroy();
		}
	});
</script>

<svelte:head>
	<title>md.uy • {page.params.id}</title>
</svelte:head>

<div
	class="col-span-2 row-start-2 mx-auto flex w-full flex-row flex-wrap items-center justify-between gap-3 md:col-span-1 md:col-start-2 md:row-start-1"
>
	<EditorModeToggle bind:viewMode />
	<div class="flex flex-row items-center gap-1 md:gap-2">
		<CopyButton ydoc={data.ydoc} />
		<DownloadButton ydoc={data.ydoc} />
		<ShareButton isSyncing={webrtcSync.isSyncing} toggleSync={webrtcSync.toggleSync} />
	</div>
</div>
<div
	class="col-span-2 row-start-3 mx-auto flex h-full w-full flex-col items-start gap-4 overflow-hidden rounded md:col-span-1 md:col-start-2 md:row-start-2"
>
	{#key page.params.id}
		<Editor provider={webrtcSync.provider} ytext={data.ytext} isVisible={viewMode === 'edit'} />
		<Preview ytext={data.ytext} isVisible={viewMode === 'preview'} />
		<Presentation ytext={data.ytext} isVisible={viewMode === 'presentation'} />
	{/key}
</div>
<div class="col-start-3 row-start-2 hidden w-full items-start gap-8 md:flex md:flex-col">
	<!-- <Profile {activeUser} /> -->
	<!-- <ConnectedUsers provider={provider} {activeUser} /> -->
</div>
