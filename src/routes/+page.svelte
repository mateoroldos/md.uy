<script lang="ts">
	import NotesTable from '$lib/components/NotesTable.svelte';
	import { getWorkspaceContext, setWorkspaceContext } from '$lib/context/workspace-context';

	const { notes, state } = getWorkspaceContext();
</script>

<svelte:head>
	<title>md.uy • markdown editor</title>
</svelte:head>

<div
	class="col-span-2 row-start-3 container mx-auto flex max-w-3xl flex-1 flex-col py-8 md:col-span-1 md:col-start-2 md:row-start-2"
>
	{$state}
	<div class="mb-10 text-center">
		<h1 class="mb-1 text-center text-2xl font-medium tracking-widest">md.uy</h1>
		<p class="text-muted-foreground/70 pb-2">the peer-to-peer markdown editor</p>
	</div>
	{#if $notes.length > 0}
		<NotesTable {notes} />
	{/if}
</div>
