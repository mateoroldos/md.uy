<script lang="ts">
	import { onMount } from 'svelte';
	import { buttonVariants } from './ui/button';
	import { Star } from '@lucide/svelte';

	let stars: number = 0;
	let error: boolean = false;

	async function fetchGitHubStars() {
		try {
			const response = await fetch('https://api.github.com/repos/mateoroldos/md.uy');
			const data = await response.json();
			stars = data.stargazers_count;
		} catch (e) {
			console.error(e);
			error = true;
		}
	}

	onMount(() => {
		fetchGitHubStars();
	});
</script>

{#if !error}
	<a
		href="https://github.com/mateoroldos/md.uy"
		target="_blank"
		rel="noopener noreferrer"
		class={buttonVariants({ variant: 'ghost', size: 'sm' })}
	>
		<Star class="size-3!" />
		{stars}
	</a>
{/if}
