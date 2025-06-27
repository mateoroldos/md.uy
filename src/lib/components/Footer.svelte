<script>
	import OnlineStatus from './OnlineStatus.svelte';
	import PwaStatus from './PWAStatus.svelte';
</script>

<footer
	class="text-foreground/50 border-t-border/40! mt-2 flex flex-col items-center justify-between gap-4 border-t px-3 pt-1.5 pb-2 font-mono text-[0.7rem] leading-[0.7] tracking-tight lg:flex-row"
>
	<div class="flex items-center gap-2">
		<a href="/about" class="hover:text-foreground duration-100">about</a>
		<span>•</span>
		<a href="https://mr19.xyz" target="_blank" class="hover:text-foreground duration-100"
			>mr19.xyz</a
		>
		<span>•</span>
		<a
			href="https://github.com/mateoroldos/md.uy"
			target="_blank"
			class="hover:text-foreground duration-100">github</a
		>
	</div>
	<span class="text-foreground/50 hidden text-[0.7rem] md:block"
		>md.uy is in an experimental state, please download important notes.</span
	>
	<div class="hidden items-center gap-5 md:flex">
		<OnlineStatus />
		<PwaStatus />
	</div>
</footer>
