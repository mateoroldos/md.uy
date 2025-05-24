<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Github } from '@lucide/svelte';
</script>

<svelte:head>
	<title>md.uy • about</title>
</svelte:head>

<div
	class="col-span-2 row-start-3 container mx-auto flex max-w-3xl flex-1 flex-col justify-center md:col-span-1 md:col-start-2 md:row-start-2"
>
	<div class="mb-10 text-center">
		<h1 class="mb-1 text-center text-2xl font-medium tracking-widest">md.uy</h1>
		<p class="text-muted-foreground/70 pb-2">the peer-to-peer markdown editor</p>
	</div>

	<div class="flex flex-col items-center gap-8">
		<div class="max-w-lg text-center leading-relaxed">
			<p class="mb-4">
				md.uy is a peer-to-peer markdown editor that lets you collaborate on documents in real-time,
				without any account or sign-up needed.
			</p>
			<p class="mb-4">
				Your data stays between you and your collaborators - we don't store anything on servers.
				Each document gets a unique ID, and that's all you need to share and work together. All data
				is shared peer-to-peer, directly from browser to browser.
			</p>
			<p class="mb-4">
				Files are stored locally on your browser's storage, so you can access your notes even when
				you are offline.
			</p>
			<p>
				Code is open-source and free to use. Feel free to contribute or report issues on GitHub.
			</p>
		</div>

		<a href="https://github.com/mateoroldos/md.uy" target="_blank" rel="noopener noreferrer">
			<Button variant="outline" class="gap-2">
				<Github class="size-4" />
				View on GitHub
			</Button>
		</a>
	</div>
</div>
