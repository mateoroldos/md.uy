<script lang="ts">
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { pwaInfo } from 'virtual:pwa-info';
	import type { LayoutProps } from './$types';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { useMachine } from '@xstate/svelte';
	import { workspaceMachine as createWorkspaceMachine } from '$lib/machines/workspace-machine/workspace-machine';
	import { setWorkspaceContext } from '$lib/context/workspace-context';
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	let { children }: LayoutProps = $props();

	const webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

	const workspaceMachine = useMachine(createWorkspaceMachine, {});
	setWorkspaceContext(workspaceMachine);
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifest}
</svelte:head>

<ModeWatcher />
<Toaster />
<div class="flex w-full flex-col">
	<div
		class="mx-auto grid w-[90%] flex-1 grid-cols-2 grid-rows-[auto_auto_1fr] flex-col gap-x-6 gap-y-1 overflow-hidden md:w-full md:grid-cols-[1fr_min(55%,_800px)_1fr] md:grid-rows-[auto_1fr_auto]"
	>
		<Breadcrumbs />
		{@render children()}
		<Sidebar />
		<Header />
	</div>
	<Footer />
</div>
