<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { NANOID_LENGTH } from '$lib/constants';
	import { generateId, isValidId } from '$lib/utils';
	import { ArrowRight, Upload } from '@lucide/svelte';

	let documentId = $state('');
	let fileInput: HTMLInputElement;

	function createNewDocument() {
		goto(`/${generateId()}`);
	}

	function joinDocument() {
		if (documentId.trim()) goto(`/${documentId}`);
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

<div
	class="col-span-2 row-start-3 container mx-auto flex max-w-3xl flex-1 flex-col justify-center md:col-span-1 md:col-start-2 md:row-start-2"
>
	<div class="mb-10 text-center">
		<h1 class="mb-1 text-center text-2xl font-medium tracking-widest">md.uy</h1>
		<p class="text-muted-foreground/70 pb-2">the peer-to-peer markdown editor</p>
	</div>

	<div class="flex flex-col items-center gap-10">
		<div class="flex flex-col items-center gap-4 md:flex-row">
			<Button class="w-52" onclick={createNewDocument}>New Document</Button>
			<input
				type="file"
				accept=".md"
				class="hidden"
				bind:this={fileInput}
				onchange={handleFileImport}
			/>
			<Button variant="outline" class="w-52" onclick={() => fileInput.click()}>
				<Upload class="mr-2 size-3!" />
				Import .md file
			</Button>
		</div>

		<div class="text-center opacity-90">
			<p class="text-muted-foreground/70 mb-3 text-sm">connect to existing document</p>
			<div class="flex justify-center gap-2">
				<Input
					class="w-44"
					bind:value={documentId}
					placeholder="document id"
					type="text"
					autocomplete="off"
					maxlength={NANOID_LENGTH}
				/>
				<Button onclick={joinDocument} disabled={!isValidId(documentId)}>
					<ArrowRight class="size-3!" />
				</Button>
			</div>
		</div>
	</div>
</div>
