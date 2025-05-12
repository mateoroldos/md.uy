<script lang="ts">
	import type { ActiveUser } from '$lib/stores/active-user.svelte';
	import { ConnectedUsers } from '$lib/stores/connected-users.svelte';
	import type { WebrtcProvider } from 'y-webrtc';
	import { slide } from 'svelte/transition';

	let { provider } = $props<{ provider?: WebrtcProvider; activeUser: ActiveUser }>();
	let isOnline = $state(true);

	const connectedUsers = new ConnectedUsers(provider);

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

<div class="text-xs">
	<h3 class="m-0 mb-2 font-medium">Connected Users</h3>

	<div class="flex flex-row flex-wrap gap-2">
		{#if !isOnline}
			<div class="text-muted-foreground/60">Working offline</div>
		{:else if connectedUsers.users.length === 0}
			<div class="text-muted-foreground/60">No users connected</div>
		{:else}
			{#each connectedUsers.users as user (user.name)}
				<div
					class="bg-muted border-border flex items-center gap-2 rounded border px-2 py-1"
					style="--user-color: {user.color}"
					transition:slide={{ duration: 150 }}
				>
					<div class="size-3 rounded-full border" style="background-color: var(--user-color)"></div>
					<span>{user.name}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>
