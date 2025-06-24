<script lang="ts">
	import { safeMarkdownToHtml } from '$lib/utils/md-to-html';
	import * as Y from 'yjs';
	import { toast } from 'svelte-sonner';

	let { ytext, isVisible } = $props<{ ytext: Y.Text; isVisible: boolean }>();

	let isEmpty = $derived(!ytext.length);

	ytext.observe(() => {
		isEmpty = !ytext.length;
	});

	const renderYjsMarkdown = (
		node: HTMLElement,
		{
			ytext
		}: {
			ytext: Y.Text;
		}
	): void => {
		const updateContent = () => {
			const result = safeMarkdownToHtml(ytext.toString());

			result.match(
				(value) => {
					node.innerHTML = value;
				},
				(error) => {
					console.error(error);
					toast('An error occured when generating note preview');
				}
			);
		};

		// Initial render
		updateContent();

		// Set up observer
		ytext.observe(updateContent);
	};
</script>

<div class="bg-card relative h-full w-full overflow-hidden rounded" class:hidden={!isVisible}>
	{#if isEmpty && isVisible}
		<div class="text-foreground/40 absolute top-5.5 left-4 z-10 sm:left-11">
			No content to preview yet
		</div>
	{/if}
	<div
		use:renderYjsMarkdown={{
			ytext
		}}
		class="prose dark:prose-invert h-full min-w-full overflow-auto px-8 py-6 break-words"
	></div>
</div>
