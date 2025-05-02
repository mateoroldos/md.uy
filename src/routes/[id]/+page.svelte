<script lang="ts">
	import Preview from '$lib/components/Preview.svelte';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import { initYjs } from '$lib/editor/initYjs';
	import Editor from '$lib/components/Editor.svelte';
	import { ActiveUser } from '$lib/stores/active-user.svelte';
	import ConnectedUsers from '$lib/components/ConnectedUsers.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import EditorModeToggle from '$lib/components/EditorModeToggle.svelte';
	import type { EditorMode } from '$lib/types';
	import Profile from '$lib/components/Profile.svelte';

	let viewMode = $state<EditorMode>('edit');

	const { ydoc, provider, ytext, cleanup } = initYjs(page.params.id);
	const activeUser = new ActiveUser('Anonymus', provider);

	onDestroy(() => {
		cleanup();
	});
</script>

<div
	class="container mx-auto flex h-screen flex-col overflow-hidden p-4 md:grid md:grid-cols-[1fr_minmax(auto,90ch)_1fr] md:gap-8 lg:gap-12"
>
	<div class="col-start-2 grid grid-rows-[auto_1fr] gap-3 overflow-hidden">
		<div class="flex flex-row items-center justify-between gap-8">
			<EditorModeToggle bind:viewMode />
			<div class="flex flex-row items-center gap-2">
				<ShareButton />
				<CopyButton {ydoc} />
			</div>
		</div>
		<div class="flex flex-col items-start gap-4 overflow-hidden rounded">
			<Editor {provider} {ytext} isVisible={viewMode === 'edit'} />
			<Preview {ytext} isVisible={viewMode === 'preview'} />
		</div>
	</div>
	<div class="order-first mt-0.5 mb-4 space-y-4 md:order-last md:col-start-3 md:space-y-8">
		<Profile {activeUser} />
		<ConnectedUsers {provider} {activeUser} />
	</div>
</div>
