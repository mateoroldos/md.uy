<script lang="ts">
	import { codemirror } from '$lib/editor/codemirror-action.svelte';
	import type { WebrtcProvider } from 'y-webrtc';
	import * as Y from 'yjs';

	let { provider, ytext, isVisible } = $props<{
		provider: WebrtcProvider;
		ytext: Y.Text;
		isVisible: boolean;
	}>();
</script>

<div
	use:codemirror={{ provider, ytext, isVisible }}
	class="h-full min-h-1 focus:outline-none"
></div>
