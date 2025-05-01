<script lang="ts">
	import { page } from '$app/stores';
	import { buttonVariants } from '$lib/components/ui/button';

	const errorMessage = $page.error?.message || 'An error occurred';
	let documentId = '';

	const isInvalidDocId = errorMessage === 'Invalid Document ID';

	if (isInvalidDocId) {
		const pathParts = $page.url.pathname.split('/');
		documentId = pathParts[pathParts.length - 1];
	}
</script>

{#if isInvalidDocId}
	<div class="container mx-auto flex min-h-screen items-center justify-center">
		<div class="text-center">
			<h1 class="mb-2 text-2xl font-medium">Invalid Document ID</h1>
			<p class="text-muted-foreground font-mono">
				The document ID <span class="text-foreground">{documentId}</span> is not valid.
			</p>

			<div class="mt-6 flex flex-row items-center justify-center gap-2">
				<a href="/" class={buttonVariants({ variant: 'link' })}>Go to Home</a>
				<a href="/new" class={buttonVariants()}>Create New Document</a>
			</div>
		</div>
	</div>
{:else}
	<div class="container mx-auto flex min-h-screen items-center justify-center">
		<div class="text-center">
			<h1 class="mb-2 text-2xl font-medium">An error occurred</h1>
			<p class="text-muted-foreground font-mono">{errorMessage}</p>

			<div class="mt-6 flex flex-row items-center justify-center gap-2">
				<a href="/" class={buttonVariants({ variant: 'link' })}>Go to Home</a>
				<a href="/new" class={buttonVariants()}>Create New Document</a>
			</div>
		</div>
	</div>
{/if}
