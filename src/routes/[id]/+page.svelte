<script lang="ts">
	import Preview from '$lib/components/Preview.svelte';
	import { page } from '$app/state';
	import { onDestroy, onMount } from 'svelte';
	import { initYjs } from '$lib/editor/initYjs';
	import Editor from '$lib/components/Editor.svelte';
	import { ActiveUser } from '$lib/stores/active-user.svelte';
	import ConnectedUsers from '$lib/components/ConnectedUsers.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import DownloadButton from '$lib/components/DownloadButton.svelte';
	import EditorModeToggle from '$lib/components/EditorModeToggle.svelte';
	import type { EditorMode } from '$lib/types';
	import Profile from '$lib/components/Profile.svelte';

	let viewMode = $state<EditorMode>('edit');

	const { ydoc, provider, ytext, cleanup } = initYjs(page.params.id);
	const activeUser = new ActiveUser('Anonymus', provider);

	onMount(() => {
		const importKey = `import-${page.params.id}`;
		const importedContent = sessionStorage.getItem(importKey);

		if (importedContent) {
			ytext.insert(0, importedContent);
			sessionStorage.removeItem(importKey);
		}
	});

	onDestroy(() => {
		cleanup();
	});
</script>

<div
	class="col-span-2 row-start-2 mx-auto flex w-full flex-row flex-wrap items-center justify-between gap-2 gap-3 md:col-span-1 md:col-start-2 md:row-start-1"
>
	<EditorModeToggle bind:viewMode />
	<div class="flex flex-row items-center gap-1 md:gap-2">
		<ShareButton />
		<CopyButton {ydoc} />
		<DownloadButton {ydoc} />
	</div>
</div>
<div
	class="col-span-2 row-start-3 mx-auto flex h-full w-full flex-col items-start gap-4 overflow-hidden rounded md:col-span-1 md:col-start-2 md:row-start-2"
>
	<Editor {provider} {ytext} isVisible={viewMode === 'edit'} />
	<Preview {ytext} isVisible={viewMode === 'preview'} />
</div>
<div class="col-start-3 row-start-2 hidden w-full items-start gap-8 md:flex md:flex-col">
	<Profile {activeUser} />
	<ConnectedUsers {provider} {activeUser} />
</div>
