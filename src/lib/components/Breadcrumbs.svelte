<script>
	import { page } from '$app/state';
</script>

<div class="flex items-center justify-start py-2 text-xs md:px-3">
	<a href="/" class="text-foreground/70">md.uy</a>
	{#if page.params.id}
		<span class="text-foreground/30 ml-1">/</span>
		<span class="ml-1 pt-[2px] font-mono">{`${page.params.id}`}</span>
	{/if}
</div>
