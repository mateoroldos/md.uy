<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<ModeWatcher />
<div
	class="mx-auto grid w-[90%] grid-cols-2 grid-rows-[auto_auto_1fr] flex-col gap-x-6 gap-y-1 overflow-hidden md:w-full md:grid-cols-[auto_min(55%,_800px)_auto] md:grid-rows-[auto_1fr_auto]"
>
	<div class="flex items-center justify-start py-2 text-xs md:px-3">
		<a href="/" class="text-foreground/50">md.uy</a>
		{#if page.params.id}
			<span class="text-foreground/50">/</span>
			<span class="font-mono">{`${page.params.id}`}</span>
		{/if}
	</div>
	{@render children()}
	<div class="col-start-2 row-start-1 flex items-center justify-end py-2 md:col-start-3 md:px-3">
		<ThemeToggle />
	</div>
</div>
