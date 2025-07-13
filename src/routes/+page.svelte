<script lang="ts">
	import NotesTable from '$lib/components/NotesTable.svelte';
	import WorkspaceSelector from '$lib/components/WorkspaceSelector.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { getWorkspaceContext } from '$lib/context/workspace-context';
	import { FileSystemContext } from '$lib/services/utils/context';
	import { FolderOpen, Loader2, AlertCircle } from '@lucide/svelte';

	let showWorkspaceSelector = $state(false);

	const {
		notes,
		state: workspaceState,
		fileSystemContext,
		isLoadingWorkspace,
		error,
		send
	} = getWorkspaceContext();

	function handleSelectWorkspace() {
		if ($fileSystemContext === FileSystemContext.OPFS) {
			// For OPFS, just trigger workspace selection (will create default)
			send({ type: 'SELECT_WORKSPACE' });
		} else {
			// For other contexts, show the workspace selector dialog
			showWorkspaceSelector = true;
		}
	}

	function handleRetry() {
		send({ type: 'RETRY' });
	}

	// Determine what to show based on state
	const showWorkspaceSelection = $derived($workspaceState === 'needsWorkspaceSelection');
	const showError = $derived($workspaceState === 'error');
	const showLoading = $derived(
		$isLoadingWorkspace ||
			$workspaceState === 'loadingLastWorkspace' ||
			$workspaceState === 'initializingWorkspace' ||
			$workspaceState === 'fetching'
	);
	const showNotes = $derived($workspaceState === 'ready' && $notes.length > 0);
	const showEmptyState = $derived($workspaceState === 'ready' && $notes.length === 0);
</script>

<svelte:head>
	<title>md.uy • markdown editor</title>
</svelte:head>

<div
	class="col-span-2 row-start-3 container mx-auto flex max-w-3xl flex-1 flex-col py-8 md:col-span-1 md:col-start-2 md:row-start-2"
>
	<div class="mb-10 text-center">
		<h1 class="mb-1 text-center text-2xl font-medium tracking-widest">md.uy</h1>
		<p class="text-muted-foreground/70 pb-2">the peer-to-peer markdown editor</p>
	</div>

	{$workspaceState}

	{#if showLoading}
		<div class="flex flex-col items-center justify-center py-12">
			<Loader2 class="text-muted-foreground mb-4 h-8 w-8 animate-spin" />
			<p class="text-muted-foreground text-sm">
				{#if $workspaceState === 'loadingLastWorkspace'}
					Loading workspace...
				{:else if $workspaceState === 'initializingWorkspace'}
					Setting up workspace...
				{:else if $workspaceState === 'fetching'}
					Loading notes...
				{:else}
					Please wait...
				{/if}
			</p>
		</div>
	{:else if showError}
		<div class="flex flex-col items-center justify-center py-12">
			<AlertCircle class="text-destructive mb-4 h-8 w-8" />
			<p class="text-destructive mb-4 text-sm">{$error}</p>
			<div class="flex gap-2">
				<Button onclick={handleRetry} variant="outline" size="sm">Try Again</Button>
				<Button onclick={handleSelectWorkspace} size="sm">Select Workspace</Button>
			</div>
		</div>
	{:else if showWorkspaceSelection}
		<div class="flex flex-col items-center justify-center py-12">
			<FolderOpen class="text-muted-foreground mb-4 h-12 w-12" />
			<h2 class="mb-2 text-lg font-medium">Welcome to md.uy</h2>
			<p class="text-muted-foreground mb-6 max-w-md text-center text-sm">
				{#if $fileSystemContext === FileSystemContext.OPFS}
					Get started by creating your default workspace. Your notes will be stored securely in your
					browser.
				{:else if $fileSystemContext === FileSystemContext.TAURI}
					Select a folder on your computer to use as your workspace for organizing your markdown
					notes.
				{:else if $fileSystemContext === FileSystemContext.BROWSER_FS}
					Choose a folder to use as your workspace. You'll be able to access your notes directly
					from your file system.
				{:else}
					Select a workspace to get started with your markdown notes.
				{/if}
			</p>
			<Button onclick={handleSelectWorkspace} class="flex items-center gap-2">
				<FolderOpen class="h-4 w-4" />
				{#if $fileSystemContext === FileSystemContext.OPFS}
					Create Workspace
				{:else}
					Select Workspace Folder
				{/if}
			</Button>
		</div>
	{:else if showNotes}
		<NotesTable {notes} />
	{:else if showEmptyState}
		<div class="flex flex-col items-center justify-center py-12">
			<h2 class="mb-2 text-lg font-medium">No notes yet</h2>
			<p class="text-muted-foreground mb-6 text-center text-sm">
				Create your first note to get started
			</p>
		</div>
	{/if}
</div>

<WorkspaceSelector bind:open={showWorkspaceSelector} />
