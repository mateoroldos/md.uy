<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { getWorkspaceContext } from '$lib/context/workspace-context';
	import { FileSystemContext } from '$lib/services/utils/context';
	import { FolderOpen, Settings, Loader2 } from '@lucide/svelte';

	interface Props {
		open: boolean;
	}

	let { open = $bindable() }: Props = $props();

	const {
		send,
		fileSystemContext,
		currentWorkspace,
		availableWorkspaces,
		isLoadingWorkspace,
		error
	} = getWorkspaceContext();

	function selectWorkspace() {
		send({ type: 'SELECT_WORKSPACE' });
		if ($fileSystemContext === FileSystemContext.OPFS) {
			// For OPFS, close immediately since it's automatic
			open = false;
		}
	}

	function switchWorkspace(workspaceId: string) {
		send({ type: 'SWITCH_WORKSPACE', workspaceId });
		open = false;
	}

	$effect(() => {
		// Auto-close dialog when workspace changes (except during loading)
		if ($currentWorkspace && !$isLoadingWorkspace) {
			open = false;
		}
	});

	// For OPFS context, don't show workspace switching options
	const isOPFS = $derived($fileSystemContext === FileSystemContext.OPFS);
	const showAvailableWorkspaces = $derived(!isOPFS && $availableWorkspaces.length > 0);
</script>

<Dialog bind:open>
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle class="flex items-center gap-2">
				<Settings class="h-5 w-5" />
				{isOPFS ? 'Workspace Info' : 'Workspace Settings'}
			</DialogTitle>
		</DialogHeader>

		<div class="space-y-4">
			<!-- Loading State -->
			{#if $isLoadingWorkspace}
				<div class="flex items-center justify-center py-8">
					<Loader2 class="text-muted-foreground mr-2 h-6 w-6 animate-spin" />
					<span class="text-muted-foreground text-sm">Loading workspace...</span>
				</div>

				<!-- Error State -->
			{:else if $error}
				<div class="border-destructive/50 bg-destructive/10 rounded-lg border p-3">
					<p class="text-destructive text-sm">{$error}</p>
				</div>
			{/if}

			<!-- Current Workspace -->
			{#if $currentWorkspace}
				<div class="rounded-lg border p-3">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="font-medium">{$currentWorkspace.name}</h3>
							<p class="text-muted-foreground text-sm">{$currentWorkspace.path}</p>
							<p class="text-muted-foreground text-xs">
								Last accessed: {$currentWorkspace.lastAccessed?.toLocaleDateString() ?? 'Never'}
							</p>
						</div>
						<div class="bg-primary/10 text-primary rounded px-2 py-1 text-xs">Current</div>
					</div>
				</div>
			{/if}

			<!-- Available Workspaces (only for non-OPFS) -->
			{#if showAvailableWorkspaces}
				<div>
					<h4 class="mb-2 text-sm font-medium">Available Workspaces</h4>
					<div class="space-y-2">
						{#each $availableWorkspaces as workspace}
							{#if workspace.id !== $currentWorkspace?.id}
								<button
									class="hover:bg-accent w-full rounded-lg border p-3 text-left transition-colors disabled:opacity-50"
									onclick={() => switchWorkspace(workspace.id)}
									disabled={$isLoadingWorkspace}
								>
									<div class="flex items-center justify-between">
										<div>
											<h3 class="font-medium">{workspace.name}</h3>
											<p class="text-muted-foreground text-sm">{workspace.path}</p>
											<p class="text-muted-foreground text-xs">
												Last accessed: {workspace.lastAccessed?.toLocaleDateString() ?? 'Never'}
											</p>
										</div>
										<FolderOpen class="text-muted-foreground h-4 w-4" />
									</div>
								</button>
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			<!-- Action Buttons -->
			{#if !isOPFS}
				<div class="flex gap-2">
					<Button
						onclick={selectWorkspace}
						variant="outline"
						class="flex-1"
						disabled={$isLoadingWorkspace}
					>
						{#if $isLoadingWorkspace}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{:else}
							<FolderOpen class="mr-2 h-4 w-4" />
						{/if}
						Select Directory
					</Button>
				</div>
			{/if}

			<!-- Context Information -->
			<div class="text-muted-foreground text-xs">
				{#if $fileSystemContext === FileSystemContext.TAURI}
					<p>
						In desktop mode, each workspace is a directory on your computer. You can switch between
						different project folders.
					</p>
				{:else if $fileSystemContext === FileSystemContext.BROWSER_FS}
					<p>
						In browser mode, you can select any directory on your computer. Your browser will
						remember your selected folders.
					</p>
				{:else if $fileSystemContext === FileSystemContext.OPFS}
					<p>
						In web mode, your workspace is stored securely in your browser's private storage. No
						setup required!
					</p>
				{/if}
			</div>
		</div>
	</DialogContent>
</Dialog>
