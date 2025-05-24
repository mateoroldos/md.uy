<script lang="ts">
	import { Star } from '@lucide/svelte';
	import type { Note } from '$lib/db';
	import { db } from '$lib/db';
	import { toggleFavorite } from '$lib/actions/notes-actions';
	import Button from './ui/button/button.svelte';

	let { note }: { note: Note } = $props();

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		toggleFavorite(note, db);
	}
</script>

<Button
	onclick={handleClick}
	variant="ghost"
	size="icon"
	aria-label={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
>
	<Star class={note.isFavorite ? 'text-primary size-3!' : 'text-muted-foreground/50 size-3!'} />
</Button>
