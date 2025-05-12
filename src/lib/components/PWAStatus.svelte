<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import { Cloud, Loader2, RefreshCcw } from '@lucide/svelte';

	const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
		onRegistered(r) {
			console.log(`SW Registered: ${r}`);
		},
		onRegisterError(error) {
			console.log('SW registration error', error);
		}
	});
</script>

<div class="flex items-center gap-1.5">
	{#if $offlineReady}
		<Cloud class="text-primary h-3 w-3" />
		<span class="text-foreground/60">Application Ready</span>
	{:else if $needRefresh}
		<RefreshCcw class="h-3 w-3 text-yellow-500" />
		<button
			class="text-foreground/60 hover:text-foreground/80"
			onclick={() => updateServiceWorker(true)}
		>
			Click to Update
		</button>
	{:else}
		<Loader2 class="h-3 w-3 animate-spin text-gray-400" />
		<span class="text-foreground/60">Installing Application</span>
	{/if}
</div>
