<script lang="ts">
	import { marked } from 'marked';
	import * as Y from 'yjs';

	let { ytext, isVisible } = $props<{ ytext: Y.Text; isVisible: boolean }>();

	let isEmpty = $state(!ytext.length);

	const markedAction = (node: HTMLElement) => {
		ytext.observe(() => {
			node.innerHTML = marked
				.use({
					gfm: true,
					breaks: true
				})
				.parse(ytext.toString()) as string;
		});
	};

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
		use:markedAction
		class="prose dark:prose-invert h-full min-w-full overflow-auto px-8 py-6 break-words"
	></div>
</div>
