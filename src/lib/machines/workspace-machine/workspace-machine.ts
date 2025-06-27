import { setup, assign, type ActorRef, type Snapshot } from 'xstate';
import type { Platform, User } from '$lib/types';
import { workspaceCacheMachine } from '../workspace-database-machine/workspace-database-machine';
import type { CachedNote } from '$lib/services/tinybase';
import { createNoteActor } from './actors/create-note-actor';

interface WorkspaceContext {
	platform: Platform;
	notes: CachedNote[];
	lastCreatedNote: string;
	cacheMachineRef: CacheMachineRef;
	user: User;
	invalidationQueue: string[];
	error: string | null;
}

type CacheMachineRef = ActorRef<Snapshot<unknown>, CacheMachineEvents>;

type CacheMachineEvents =
	| { type: 'INVALIDATE_NOTES'; filenames: string[] }
	| { type: 'INVALIDATE_ALL' };

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
	},
	actors: {
		workspaceCache: workspaceCacheMachine,
		createNoteActor: createNoteActor
	},
	actions: {
		invalidateNotes: ({ context }) => {
			context.cacheMachineRef.send({
				type: 'INVALIDATE_NOTES',
				filenames: context.invalidationQueue
			});
		}
	}
}).createMachine({
	context: ({ spawn, self }) => ({
		platform: 'web',
		notes: [],
		user: {
			name: '',
			color: ''
		},
		lastCreatedNote: '',
		cacheMachineRef: spawn('workspaceCache', {
			id: 'workspace-cache',
			input: { platform: 'web', parentRef: self }
		}),
		invalidationQueue: [],
		error: null
	}),
	initial: 'fetching',
	invoke: {
		src: 'workspaceCache',
		input: ({ self, context: { platform } }) => ({
			platform,
			parentRef: self
		})
	},
	states: {
		fetching: {
			description: 'Load notes from OPFS or FS',
			on: {
				CACHE_READY: {
					actions: assign({ notes: ({ event }) => [...event.notes] }),
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
				}
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
					target: 'fetching',
					actions: assign({ error: null })
				}
			}
		}
	}
});
