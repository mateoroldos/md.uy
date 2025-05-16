<script lang="ts">
	import { Star, Pin, Trash2, Ellipsis } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { db, type Note } from '$lib/db';

	let { note }: { note: Note } = $props();

	async function deleteNote(e: MouseEvent) {
		e.stopPropagation();
		try {
			await db.notes.delete(note.id);
		} catch (error) {
			console.error('Failed to delete note:', error);
		}
	}

	async function togglePin(e: MouseEvent) {
		e.stopPropagation();
		try {
			await db.notes.update(note.id, { isPinned: !note.isPinned });
		} catch (error) {
			console.error('Failed to toggle pin:', error);
		}
	}

	async function toggleFavorite(e: MouseEvent) {
		e.stopPropagation();
		try {
			await db.notes.update(note.id, { isFavorite: !note.isFavorite });
		} catch (error) {
			console.error('Failed to toggle favorite:', error);
		}
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
			<Pin class="mr-2 h-4 w-4" />{note.isPinned ? 'Unpin' : 'Pin'}
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={toggleFavorite}>
			<Star class="mr-2 h-4 w-4" />{note.isFavorite ? 'Unfavorite' : 'Favorite'}
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onclick={deleteNote} class="text-red-600">
			<Trash2 class="mr-2 h-4 w-4" />Delete
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
