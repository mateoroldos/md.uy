<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import GitHubStars from '$lib/components/GitHubStars.svelte';
	import OnlineStatus from '$lib/components/OnlineStatus.svelte';
	import PWAStatus from '$lib/components/PWAStatus.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { pwaInfo } from 'virtual:pwa-info';

	const webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

	let { children } = $props();
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifest}
</svelte:head>

<ModeWatcher />
<div class="flex w-full flex-col">
	<div
		class="mx-auto grid w-[90%] flex-1 grid-cols-2 grid-rows-[auto_auto_1fr] flex-col gap-x-6 gap-y-1 overflow-hidden md:w-full md:grid-cols-[1fr_min(55%,_800px)_1fr] md:grid-rows-[auto_1fr_auto]"
	>
		<div class="flex items-center justify-start py-2 text-xs md:px-3">
			<a href="/" class="text-foreground/70">md.uy</a>
			{#if page.params.id}
				<span class="text-foreground/30 ml-1">/</span>
				<span class="ml-1 pt-[2px] font-mono">{`${page.params.id}`}</span>
			{/if}
		</div>
		{@render children()}
		<div
			class="col-start-2 row-start-1 flex items-center justify-end gap-1 py-2 md:col-start-3 md:px-3"
		>
			<GitHubStars />
			<ThemeToggle />
		</div>
	</div>
	<footer
		class="text-foreground/50 border-t-border/40! mt-2 flex justify-between gap-2 border-t px-3 pt-1 pb-2 font-mono text-[0.7rem] tracking-tight"
	>
		<div class="flex gap-2">
			<a href="/about" class="hover:text-foreground duration-100">about</a>
			<span>•</span>
			<a href="https://mr19.xyz" target="_blank" class="hover:text-foreground duration-100"
				>mr19.xyz</a
			>
			<span>•</span>
			<a
				href="https://github.com/mateoroldos/md.uy"
				target="_blank"
				class="hover:text-foreground inline-flex items-center gap-1 duration-100">github</a
			>
		</div>
		<div class="flex items-center gap-5">
			<OnlineStatus />
			<PWAStatus />
		</div>
	</footer>
</div>
