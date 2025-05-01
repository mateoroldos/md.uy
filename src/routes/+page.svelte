<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { generateId } from '$lib/utils';

	let documentId = $state('');

	function createNewDocument() {
		goto(`/document/${generateId()}`);
	}

	function joinDocument() {
		if (documentId.trim()) goto(`/document/${documentId}`);
	}
</script>

<div class="container mx-auto flex h-full max-w-3xl flex-col justify-center">
	<h1 class="mb-8 text-center text-2xl font-medium">Collaborative Markdown</h1>

	<div class="flex flex-col gap-8">
		<div class="text-center">
			<p class="mb-3 text-sm text-gray-600">Start fresh with a new document</p>
			<Button class="w-64" onclick={createNewDocument}>Create New Document</Button>
		</div>

		<div class="text-center">
			<p class="mb-3 text-sm text-gray-600">Or join an existing document</p>
			<div class="flex justify-center gap-3">
				<Input
					class="w-64"
					bind:value={documentId}
					placeholder="Enter document ID"
					type="text"
					autocomplete="off"
				/>
				<Button onclick={joinDocument} disabled={!documentId.trim()}>Join</Button>
			</div>
		</div>
	</div>
</div>
