<script lang="ts">
	import { codemirror } from '$lib/editor/codemirror-action.svelte';
	import type { WebrtcProvider } from 'y-webrtc';
	import * as Y from 'yjs';

	let { provider, ytext, isVisible } = $props<{
		provider: WebrtcProvider | null;
		ytext: Y.Text;
		isVisible: boolean;
	}>();

	let isEmpty = $derived(!ytext.length);

	ytext.observe(() => {
		isEmpty = !ytext.length;
	});
</script>

<div class="relative h-full w-full overflow-hidden" class:hidden={!isVisible}>
	{#if isEmpty && isVisible}
		<span class="text-foreground/40 absolute top-6.5 left-4 z-10 font-mono text-sm sm:left-11">
			Start typing to add content...
		</span>
	{/if}
	<div
		use:codemirror={{
			provider,
			ytext,
			isVisible
		}}
		class="h-full focus:outline-none"
	></div>
</div>
