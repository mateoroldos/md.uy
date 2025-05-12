<script lang="ts">
	import { Wifi, WifiOff } from '@lucide/svelte';

	let isOnline = $state(true);

	$effect(() => {
		isOnline = navigator.onLine;

		const handleOnline = () => (isOnline = true);
		const handleOffline = () => (isOnline = false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	});
</script>

<div class="flex items-center gap-1.5">
	{#if isOnline}
		<Wifi class="text-primary h-3 w-3" />
	{:else}
		<WifiOff class="h-3 w-3 text-gray-400" />
	{/if}
	<span class="text-foreground/60">{isOnline ? 'Online' : 'Offline'}</span>
</div>
