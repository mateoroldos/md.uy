<script lang="ts">
	import { Star, Pin, Trash2, Ellipsis } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { db, type Note } from '$lib/db';
	import {
		deleteNote as deleteNoteAction,
		togglePin as togglePinAction,
		toggleFavorite as toggleFavoriteAction
	} from '$lib/actions/notes-actions';

	let { note }: { note: Note } = $props();

	async function deleteNote(e: MouseEvent) {
		e.stopPropagation();
		await deleteNoteAction(note, db);
	}

	async function togglePin(e: MouseEvent) {
		e.stopPropagation();
		await togglePinAction(note, db);
	}

	async function toggleFavorite(e: MouseEvent) {
		e.stopPropagation();
		await toggleFavoriteAction(note, db);
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onclick={togglePin}>
			<Pin class="mr-2 size-3!" />{note.isPinned ? 'Unpin' : 'Pin'}
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={toggleFavorite}>
			<Star class="mr-2 size-3!" />{note.isFavorite ? 'Unfavorite' : 'Favorite'}
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onclick={deleteNote} class="text-destructive">
			<Trash2 class="mr-2 size-3!" />Delete
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
