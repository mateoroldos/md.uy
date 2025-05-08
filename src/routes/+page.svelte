<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { NANOID_LENGTH } from '$lib/constants';
	import { generateId, isValidId } from '$lib/utils';
	import { ArrowRight } from '@lucide/svelte';

	let documentId = $state('');

	function createNewDocument() {
		goto(`/${generateId()}`);
	}

	function joinDocument() {
		if (documentId.trim()) goto(`/${documentId}`);
	}
</script>

<div
	class="col-start-2 row-start-2 container mx-auto flex max-w-3xl flex-1 flex-col justify-center"
>
	<div class="mb-10 text-center">
		<h1 class="mb-1 text-center text-xl font-light tracking-widest">md.uy</h1>
		<p class="text-muted-foreground text-xs">peer-to-peer markdown editor</p>
	</div>

	<div class="flex flex-col items-center gap-10">
		<Button class="w-52" onclick={createNewDocument}>New Document</Button>

		<div class="text-center opacity-90">
			<p class="text-muted-foreground mb-3 text-xs">connect to existing document</p>
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
