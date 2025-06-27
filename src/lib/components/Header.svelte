<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import GitHubStars from '$lib/components/GitHubStars.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { generateId, isValidId } from '$lib/utils';
	import { ArrowRight, Plus, Upload } from '@lucide/svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { NANOID_LENGTH } from '$lib/constants';
	import { getWorkspaceContext } from '$lib/context/workspace-context';
	import { waitFor } from 'xstate';

	const { actorRef, send, lastCreatedNote } = getWorkspaceContext();

	let documentId = $state('');
	let fileInput: HTMLInputElement;

	async function createNote() {
		const noteAddedBefore = $lastCreatedNote;

		send({ type: 'CREATE_NOTE' });

		await waitFor(actorRef, (snapshot) => snapshot.context.lastCreatedNote !== noteAddedBefore);

		goto(`/${$lastCreatedNote}`);
	}

	function joinDocument() {
		if (isValidId(documentId.trim())) goto(`/${documentId}`);
	}

	async function handleFileImport(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		if (!file.name.toLowerCase().endsWith('.md')) {
			alert('Please select a valid markdown (.md) file');
			return;
		}

		try {
			const content = await file.text();
			const newDocId = generateId();

			sessionStorage.setItem(`import-${newDocId}`, content);

			goto(`/${newDocId}`);
		} catch (error) {
			console.error('Error reading file:', error);
			alert('Error reading the file. Please try again.');
		}
	}
</script>

<header
	class="col-start-2 row-start-1 flex items-center justify-end gap-2 py-2 md:col-start-3 md:px-3"
>
	{$lastCreatedNote}
	<div class="hidden md:block">
		<GitHubStars />
	</div>
	<ThemeToggle />
	<div class="relative ml-1 hidden md:block">
		<Input
			class="h-7 w-32 pr-9 font-mono text-xs md:text-xs"
			bind:value={documentId}
			placeholder="document id"
			type="text"
			autocomplete="off"
			maxlength={NANOID_LENGTH}
		/>
		<Button
			class="absolute top-1/2 right-1 size-5 -translate-y-1/2"
			onclick={joinDocument}
			disabled={!isValidId(documentId)}
			variant="ghost"
			size="icon"
		>
			<ArrowRight class="size-3!" />
		</Button>
	</div>
	<input
		type="file"
		accept=".md"
		class="hidden"
		bind:this={fileInput}
		onchange={handleFileImport}
	/>
	<Button size="icon" variant="outline" onclick={() => fileInput.click()}>
		<Upload class="size-3!" />
	</Button>
	<Button size="icon" onclick={() => createNote()}><Plus class="size-3!" /></Button>
</header>
