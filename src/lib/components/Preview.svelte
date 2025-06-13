<script lang="ts">
	import * as Y from 'yjs';
	import { markdownToHtml } from '$lib/utils/md-to-html';

	let { ytext, isVisible } = $props<{ ytext: Y.Text; isVisible: boolean }>();

	let isEmpty = $derived(!ytext.length);

	ytext.observe(() => {
		isEmpty = !ytext.length;
	});
</script>

<div class="bg-card relative h-full w-full overflow-hidden rounded" class:hidden={!isVisible}>
	{#if isEmpty && isVisible}
		<div class="text-foreground/40 absolute top-5.5 left-4 z-10 sm:left-11">
			No content to preview yet
		</div>
	{/if}
	<div
		use:markdownToHtml={{
			ytext
		}}
		class="prose dark:prose-invert h-full min-w-full overflow-auto px-8 py-6 break-words"
	></div>
</div>
