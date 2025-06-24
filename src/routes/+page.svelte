<script lang="ts">
	import { useMachine, useSelector } from '@xstate/svelte';
	import { workspaceMachine } from '$lib/machines/workspace-machine/workspace-machine';
	import NotesTable from '$lib/components/NotesTable.svelte';

	const { snapshot, send, actorRef } = useMachine(workspaceMachine, {});

	const notes = useSelector(actorRef, (snapshot) => snapshot.context.notes);
	console.log('noo', $notes);
</script>

<svelte:head>
	<title>md.uy • markdown editor</title>
</svelte:head>

<div
	class="col-span-2 row-start-3 container mx-auto flex max-w-3xl flex-1 flex-col py-8 md:col-span-1 md:col-start-2 md:row-start-2"
>
	<div class="mb-10 text-center">
		<h1 class="mb-1 text-center text-2xl font-medium tracking-widest">md.uy</h1>
		<p class="text-muted-foreground/70 pb-2">the peer-to-peer markdown editor</p>
	</div>
	<!-- <NotesTable {notes} /> -->
	<div class="flex flex-col gap-2">
		{#each $notes as note (note.filename)}
			<div>
				<a href={`/${note.filename}`}>
					{note.title}
				</a>
			</div>
		{/each}
	</div>
</div>
