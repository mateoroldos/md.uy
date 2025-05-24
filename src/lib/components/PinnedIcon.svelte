<script lang="ts">
	import { Pin } from '@lucide/svelte';
	import type { Note } from '$lib/db';
	import { db } from '$lib/db';
	import { togglePin } from '$lib/actions/notes-actions';
	import Button from './ui/button/button.svelte';

	let { note }: { note: Note } = $props();

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		togglePin(note, db);
	}
</script>

<Button
	onclick={handleClick}
	variant="ghost"
	size="icon"
	aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
>
	<Pin class={note.isPinned ? 'text-primary size-3!' : 'text-muted-foreground/50 size-3!'} />
</Button>
