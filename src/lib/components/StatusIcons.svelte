<script lang="ts">
	import { Pin, Star } from '@lucide/svelte';
	import type { Note } from '$lib/db';

	let { note }: { note: Note } = $props();
</script>

<div class="flex gap-1">
	{#if note.isPinned}
		<Pin class="h-4 w-4 text-blue-500" />
	{/if}
	{#if note.isFavorite}
		<Star class="h-4 w-4 text-yellow-500" />
	{/if}
</div>
