import { setup, assign, fromPromise, type ActorRef, type Snapshot } from 'xstate';
import type { Platform, User } from '$lib/types';
import { workspaceCacheMachine } from '../workspace-database-machine/workspace-database-machine';
import type { CachedNote } from '$lib/services/tinybase';
import { createNoteActor } from './actors/create-note-actor';
import { detectContext, FileSystemContext } from '$lib/services/utils/context';
import { selectWorkspaceActor } from './actors/select-workspace-actor';

interface WorkspaceInfo {
	id: string;
	name: string;
	path: string;
	lastAccessed: Date;
}

interface WorkspaceContext {
	platform: Platform;
	fileSystemContext: FileSystemContext;
	currentWorkspace: WorkspaceInfo | null;
	availableWorkspaces: WorkspaceInfo[];
	notes: CachedNote[];
	lastCreatedNote: string;
	cacheMachineRef: CacheMachineRef | null;
	user: User;
	invalidationQueue: string[];
	error: string | null;
	isLoadingWorkspace: boolean;
}

type CacheMachineRef = ActorRef<Snapshot<unknown>, CacheMachineEvents>;

type CacheMachineEvents =
	| { type: 'INVALIDATE_NOTES'; filenames: string[] }
	| { type: 'INVALIDATE_ALL' };

async function loadLastWorkspace(
	fileSystemContext: FileSystemContext
): Promise<WorkspaceInfo | null> {
	try {
		const stored = localStorage.getItem('md-uy-workspaces');
		if (!stored) return null;

		const workspaces = JSON.parse(stored) as WorkspaceInfo[];
		if (workspaces.length === 0) return null;

		if (fileSystemContext === FileSystemContext.OPFS) {
			const defaultWorkspace = workspaces.find((w) => w.id === 'default');
			if (defaultWorkspace) return defaultWorkspace;

			// If no default, use most recent
			const mostRecent = workspaces.sort(
				(a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
			)[0];
			return mostRecent;
		}

		// For other contexts, use the most recently accessed workspace
		const mostRecent = workspaces.sort(
			(a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
		)[0];

		return {
			...mostRecent,
			lastAccessed: new Date(mostRecent.lastAccessed)
		};
	} catch {
		return null;
	}
}

export const workspaceMachine = setup({
	types: {
		context: {} as WorkspaceContext,
		events: {} as
			| {
					type: 'TOGGLE_FAVORITE';
					filename: string;
			  }
			| {
					type: 'TOGGLE_PINNED';
					filename: string;
			  }
			| {
					type: 'CREATE_NOTE';
					filename?: string;
			  }
			| {
					type: 'INVALIDATE_NOTES';
					filenames: string[];
			  }
			| {
					type: 'CACHE_READY';
					notes: CachedNote[];
			  }
			| {
					type: 'RETRY';
			  }
			| {
					type: 'SELECT_WORKSPACE';
			  }
			| {
					type: 'SWITCH_WORKSPACE';
					workspaceId: string;
			  }
			| {
					type: 'WORKSPACE_SELECTED';
					workspace: WorkspaceInfo;
			  }
			| {
					type: 'WORKSPACE_SELECTION_CANCELLED';
			  }
			| {
					type: 'LAST_WORKSPACE_LOADED';
					workspace: WorkspaceInfo | null;
			  }
	},
	actors: {
		workspaceCache: workspaceCacheMachine,
		createNoteActor: createNoteActor,
		selectWorkspaceActor: selectWorkspaceActor,
		loadLastWorkspace: fromPromise(
			async ({ input }: { input: { fileSystemContext: FileSystemContext } }) => {
				return await loadLastWorkspace(input.fileSystemContext);
			}
		)
	},
	actions: {
		invalidateNotes: ({ context }) => {
			context.cacheMachineRef?.send({
				type: 'INVALIDATE_NOTES',
				filenames: context.invalidationQueue
			});
		},
		loadAvailableWorkspaces: assign({
			availableWorkspaces: () => {
				try {
					const stored = localStorage.getItem('md-uy-workspaces');
					if (!stored) return [];

					const workspaces = JSON.parse(stored) as WorkspaceInfo[];
					return workspaces.map((w) => ({
						...w,
						lastAccessed: new Date(w.lastAccessed)
					}));
				} catch {
					return [];
				}
			}
		})
	}
}).createMachine({
	context: () => {
		const detectedContext = detectContext();
		const platform: Platform = detectedContext === FileSystemContext.TAURI ? 'desktop' : 'web';

		return {
			platform,
			fileSystemContext: detectedContext,
			currentWorkspace: null,
			availableWorkspaces: [],
			notes: [],
			user: {
				name: '',
				color: ''
			},
			lastCreatedNote: '',
			cacheMachineRef: null,
			invalidationQueue: [],
			error: null,
			isLoadingWorkspace: false
		};
	},
	initial: 'loadingLastWorkspace',
	states: {
		loadingLastWorkspace: {
			description: 'Loading the last used workspace from localStorage',
			entry: [assign({ isLoadingWorkspace: true }), { type: 'loadAvailableWorkspaces' }],
			invoke: {
				src: 'loadLastWorkspace',
				input: ({ context }) => ({
					fileSystemContext: context.fileSystemContext
				}),
				onDone: [
					{
						target: 'initializingWorkspace',
						guard: ({ event }) => event.output !== null,
						actions: assign({
							currentWorkspace: ({ event }) => event.output,
							isLoadingWorkspace: false
						})
					},
					{
						target: 'needsWorkspaceSelection',
						actions: assign({ isLoadingWorkspace: false })
					}
				],
				onError: {
					target: 'needsWorkspaceSelection',
					actions: assign({
						isLoadingWorkspace: false,
						error: 'Failed to load last workspace'
					})
				}
			}
		},
		needsWorkspaceSelection: {
			description: 'No workspace found, user needs to select one',
			on: {
				SELECT_WORKSPACE: {
					target: 'selectingWorkspace'
				}
			}
		},
		selectingWorkspace: {
			description: 'User is selecting a workspace',
			entry: assign({ isLoadingWorkspace: true }),
			invoke: {
				src: 'selectWorkspaceActor',
				input: ({ context }) => ({
					fileSystemContext: context.fileSystemContext,
					currentWorkspace: context.currentWorkspace
				}),
				onDone: [
					{
						target: 'initializingWorkspace',
						guard: ({ event }) => event.output.isOk(),
						actions: assign({
							currentWorkspace: ({ event }) => event.output._unsafeUnwrap(),
							error: null,
							isLoadingWorkspace: false
						})
					},
					{
						target: 'error',
						guard: ({ event }) => event.output.isErr(),
						actions: assign({
							error: ({ event }) =>
								`Workspace selection failed: ${event.output._unsafeUnwrapErr().type}`,
							isLoadingWorkspace: false
						})
					}
				]
			},
			on: {
				SELECT_WORKSPACE: {
					target: 'selectingWorkspace',
					reenter: true
				}
			}
		},
		initializingWorkspace: {
			description: 'Load notes from workspace',
			entry: [
				assign({ isLoadingWorkspace: true }),
				assign({
					cacheMachineRef: ({ spawn, self, context }) => {
						if (context.cacheMachineRef) {
							context.cacheMachineRef.stop();
						}
						return spawn('workspaceCache', {
							id: 'workspace-cache',
							input: {
								platform: context.platform,
								parentRef: self,
								workspaceId: context.currentWorkspace?.id || 'default',
								workspacePath: context.currentWorkspace?.path
							}
						});
					}
				})
			],
			on: {
				CACHE_READY: {
					actions: assign({
						notes: ({ event }) => [...event.notes],
						isLoadingWorkspace: false
					}),
					target: 'ready'
				}
			}
		},
		invalidating: {
			description: 'Invalidating cached notes',
			entry: [
				{
					type: 'invalidateNotes'
				}
			],
			on: {
				CACHE_READY: {
					actions: assign({ notes: ({ event }) => [...event.notes], invalidationQueue: [] }),
					target: 'ready'
				}
			}
		},
		ready: {
			on: {
				CREATE_NOTE: {
					target: 'creating-note'
				},
				SELECT_WORKSPACE: {
					target: 'selectingWorkspace'
				},
				SWITCH_WORKSPACE: {
					target: 'switchingWorkspace',
					actions: assign({
						currentWorkspace: ({ event, context }) => {
							const workspace = context.availableWorkspaces.find((w) => w.id === event.workspaceId);
							return workspace || context.currentWorkspace;
						}
					})
				}
			}
		},
		switchingWorkspace: {
			description: 'Switching to a different workspace',
			always: {
				target: 'initializingWorkspace'
			}
		},
		'creating-note': {
			invoke: {
				src: 'createNoteActor',
				input: ({ context: { notes } }) => ({
					existingNotes: notes
				}),
				onDone: [
					{
						target: 'invalidating',
						guard: ({ event }) => event.output.isOk(),
						actions: assign({
							invalidationQueue: ({ context: { invalidationQueue }, event }) => [
								...invalidationQueue,
								event.output._unsafeUnwrap()
							],
							lastCreatedNote: ({ event }) => {
								console.log(event.output._unsafeUnwrap());
								return event.output._unsafeUnwrap();
							}
						})
					},
					{
						target: 'error',
						guard: ({ event }) => event.output.isErr(),
						actions: assign({
							error: ({ event }) => `Error creating file: ${event.output._unsafeUnwrapErr().type}`
						})
					}
				]
			}
		},
		error: {
			on: {
				RETRY: {
					target: 'loadingLastWorkspace',
					actions: assign({ error: null })
				},
				SELECT_WORKSPACE: {
					target: 'selectingWorkspace',
					actions: assign({ error: null })
				}
			}
		}
	}
});
