<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { fly } from 'svelte/transition';

	const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
		onRegistered(r) {
			console.log(`SW Registered: ${r}`);
		},
		onRegisterError(error) {
			console.log('SW registration error', error);
		}
	});

	const close = () => {
		offlineReady.set(false);
		needRefresh.set(false);
	};

	$: toast = $offlineReady || $needRefresh;
</script>

{#if toast}
	<div
		transition:fly={{ y: 20, duration: 300 }}
		class={cn(
			'bg-card text-card-foreground fixed right-0 bottom-0 z-50 m-4 rounded-lg border p-4 shadow-lg'
		)}
		role="alert"
	>
		<div class="mb-4 text-sm">
			{#if $offlineReady}
				<span>App ready to work offline</span>
			{:else}
				<span>New content available, click on reload button to update.</span>
			{/if}
		</div>
		<div class="flex gap-2">
			{#if $needRefresh}
				<Button variant="default" size="sm" onclick={() => updateServiceWorker(true)}>Reload</Button
				>
			{/if}
			<Button variant="outline" size="sm" onclick={close}>Close</Button>
		</div>
	</div>
{/if}
