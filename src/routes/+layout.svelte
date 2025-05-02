<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<ModeWatcher />
<div class="absolute top-5.5 left-4 text-xs">
	<a href="/" class="text-foreground/50">md.mr19.xyz</a>
	{#if page.params.id}
		<span class="text-foreground/50">/</span>
		<span class="font-mono text-xs">{`${page.params.id}`}</span>
	{/if}
</div>
<div class="absolute top-3 right-4">
	<ThemeToggle />
</div>
{@render children()}
