<script lang="ts">
	import Preview from '$lib/components/Preview.svelte';
	import { page } from '$app/state';
	import Editor from '$lib/components/Editor.svelte';
	import Presentation from '$lib/components/Presentation.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import DownloadButton from '$lib/components/DownloadButton.svelte';
	import EditorModeToggle from '$lib/components/EditorModeToggle.svelte';
	import type { EditorMode } from '$lib/types';
	import FilenameEditButton from '$lib/components/FilenameEditButton.svelte';
	import { noteMachine } from '$lib/machines/note-machine/note-machine';
	import { useMachine, useSelector } from '@xstate/svelte';
	import { goto } from '$app/navigation';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import ConnectedUsers from '$lib/components/ConnectedUsers.svelte';

	let viewMode = $state<EditorMode>('edit');

	const { snapshot, send, actorRef } = useMachine(noteMachine, {
		input: {
			filename: page.params.id
		}
	});

	const ydoc = useSelector(actorRef, (snapshot) => snapshot.context.ydoc);
	const ytext = useSelector(actorRef, (snapshot) => snapshot.context.ytext);
	const filename = useSelector(actorRef, (snapshot) => snapshot.context.filename);
	const syncProvider = useSelector(actorRef, (snapshot) => snapshot.context.syncProvider);
	const user = useSelector(actorRef, (snapshot) => snapshot.context.user);

	function handleFilenameChange(newFilename: string) {
		send({ type: 'SET_FILE_NAME', value: newFilename });
		goto(`/${newFilename}`);
	}

	function toggleSync() {
		send({
			type: 'TOGGLE_SYNC'
		});
	}
</script>

<svelte:head>
	<title>md.uy • {page.params.id}</title>
</svelte:head>

{#if $snapshot.value === 'initializing' || $snapshot.value === 'fetching'}
	Loading...
{:else if $ytext && $ydoc}
	<div
		class="col-span-2 row-start-2 mx-auto flex w-full flex-row flex-wrap items-center justify-between gap-3 md:col-span-1 md:col-start-2 md:row-start-1"
	>
		<div class="flex items-center gap-2">
			<EditorModeToggle bind:viewMode />
			{#if $filename}
				<div class="flex items-center gap-1">
					<span class="text-muted-foreground text-sm">{$filename}</span>
					<FilenameEditButton filename={$filename} onSave={handleFilenameChange} />
				</div>
			{/if}
		</div>
		<div
			class="mb-1 flex w-full flex-row items-center justify-between gap-1 md:mb-0 md:w-fit md:justify-start md:gap-2"
		>
			<div>
				<CopyButton ydoc={$ydoc} />
				<DownloadButton ydoc={$ydoc} />
			</div>
			{$filename} aaa
			<ShareButton isSyncing={$snapshot.value.active === 'sync'} {toggleSync} ytext={$ytext} />
		</div>
	</div>

	<div
		class="col-span-2 row-start-2 mx-auto flex h-full w-full flex-col items-start gap-4 overflow-hidden rounded md:col-span-1 md:col-start-2 md:row-start-2"
	>
		{#key page.params.id}
			<Editor ytext={$ytext} isVisible={viewMode === 'edit'} />
			<Preview ytext={$ytext} isVisible={viewMode === 'preview'} />
			<Presentation ytext={$ytext} isVisible={viewMode === 'presentation'} />
		{/key}
	</div>
	{$snapshot.value.active}
	{#if $snapshot.value.active === 'sync' && $syncProvider}
		nfewqjfkeq
		<div class="col-start-3 row-start-2 hidden w-full items-start gap-8 md:flex md:flex-col">
			<Profile activeUser={$user} />
			<ConnectedUsers provider={$syncProvider} activeUser={$user} />
		</div>
	{/if}
{:else}
	There was an error loading this note
{/if}
