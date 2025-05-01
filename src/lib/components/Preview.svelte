<script lang="ts">
	import { marked } from 'marked';
	import * as Y from 'yjs';

	let { ytext } = $props<{ ytext: Y.Text }>();

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
</script>

<div use:markedAction class="prose h-full min-w-full overflow-auto px-8 py-6 break-words"></div>
