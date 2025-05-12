<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import { Cloud, RefreshCcw } from '@lucide/svelte';

	const { needRefresh, updateServiceWorker } = useRegisterSW({
		onRegistered(r) {
			console.log(`SW Registered: ${r}`);
		},
		onRegisterError(error) {
			console.log('SW registration error', error);
		}
	});
</script>

<div class="flex items-center gap-1.5">
	{#if $needRefresh}
		<RefreshCcw class="h-3 w-3 text-yellow-500" />
		<button
			class="text-foreground/60 hover:text-foreground/80"
			onclick={() => updateServiceWorker(true)}
		>
			Click to Update
		</button>
	{:else}
		<Cloud class="text-primary h-3 w-3" />
		<span class="text-foreground/60">Application Ready</span>
	{/if}
</div>
