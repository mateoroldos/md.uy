<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Edit3 } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { filename, onSave } = $props<{
		filename: string;
		onSave: (newFilename: string) => void;
	}>();

	let open = $state(false);
	let newFilename = $state('');

	function openDialog() {
		newFilename = filename;
		open = true;
	}

	function handleSave() {
		if (newFilename.trim() && newFilename.trim() !== filename) {
			onSave(newFilename.trim());
		}
		open = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSave();
		}
	}
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={openDialog}
	title="Edit filename"
	class="size-6"
>
	<Edit3 class="size-3" />
</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit Filename</Dialog.Title>
			<Dialog.Description>
				Change the filename for this note. The file will be renamed automatically.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="filename">Filename</Label>
				<Input
					id="filename"
					bind:value={newFilename}
					placeholder="Enter filename..."
					onkeydown={handleKeydown}
					autofocus
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>
				Cancel
			</Button>
			<Button 
				onclick={handleSave}
				disabled={!newFilename.trim() || newFilename.trim() === filename}
			>
				Save
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>