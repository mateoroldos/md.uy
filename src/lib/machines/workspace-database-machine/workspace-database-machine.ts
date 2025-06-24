import { assign, sendTo, setup, type ActorRef, type Snapshot } from 'xstate';
import { type IndexedDbPersister } from 'tinybase/persisters/persister-indexed-db';
import type { Platform } from '$lib/types';
import { syncNotesFromOPFSActor } from './actors/sync-notes-actor';
import { initializeDatabaseActor } from './actors/initialize-database-actor';
import type { NotesCacheDatabase, CachedNote } from '$lib/services/tinybase';

interface WorkspaceDatabaseContext {
	workspaceId: string;
	store: NotesCacheDatabase | null;
	persister: IndexedDbPersister | null;
	platform: Platform;
	error: string | null;
	invalidatingFilenames?: string[];
	parentRef: ParentActor;
}

type ParentActor = ActorRef<Snapshot<unknown>, CacheReadyEvent>;

interface WorkspaceDatabaseInput {
	// workspaceId: string;
	platform?: Platform;
	parentRef: ParentActor;
}

type CacheReadyEvent = {
	type: 'CACHE_READY';
	notes: CachedNote[];
};

type WorkspaceDatabaseEvents =
	| { type: 'INVALIDATE_NOTES'; filenames: string[] }
	| { type: 'INVALIDATE_ALL' }
	| { type: 'RETRY' }
	| { type: 'DESTROY' }
	| CacheReadyEvent;

export const workspaceCacheMachine = setup({
	types: {
		context: {} as WorkspaceDatabaseContext,
		events: {} as WorkspaceDatabaseEvents,
		input: {} as WorkspaceDatabaseInput
	},
	actors: {
		initializeDatabase: initializeDatabaseActor,
		syncNotesFromOPFS: syncNotesFromOPFSActor
	}
}).createMachine({
	id: 'notesDatabase',
	initial: 'initializing',
	context: ({ input }) => ({
		workspaceId: 'TODO.workspaceId',
		store: null,
		persister: null,
		platform: input.platform || 'web',
		parentRef: input.parentRef,
		error: null
	}),
	states: {
		initializing: {
			invoke: {
				src: 'initializeDatabase',
				input: ({ context: { workspaceId } }) => ({ workspaceId }),
				onDone: [
					{
						target: 'syncing',
						guard: ({ event }) => event.output.isOk(),
						actions: assign({
							store: ({ event }) => event.output._unsafeUnwrap().store,
							persister: ({ event }) => event.output._unsafeUnwrap().persister,
							error: null
						})
					},
					{
						target: 'error',
						guard: ({ event }) => event.output.isErr(),
						actions: assign({
							error: ({ event }) =>
								`Database initialization failed: ${event.output._unsafeUnwrapErr().type}`
						})
					}
				]
			}
		},
		syncing: {
			invoke: {
				src: 'syncNotesFromOPFS',
				input: ({ context }) => ({
					store: context.store!,
					platform: context.platform
				}),
				onDone: [
					{
						target: 'ready',
						guard: ({ event }) => event.output.isOk(),
						actions: assign({
							error: null
						})
					},
					{
						target: 'error',
						guard: ({ event }) => event.output.isErr(),
						actions: assign({
							error: ({ event }) => `Sync failed: ${event.output._unsafeUnwrapErr().type}`
						})
					}
				]
			}
		},
		ready: {
			entry: sendTo(
				({ context }) => context.parentRef,
				({ context }) => {
					const notes = context.store?.getTable('notes');
					return {
						type: 'CACHE_READY',
						notes: notes
							? (Object.entries(notes).map(([filename, note]) => {
									return {
										filename,
										...note
									};
								}) as CachedNote[])
							: []
					};
				}
			),
			on: {
				INVALIDATE_NOTES: {
					target: 'invalidating',
					actions: assign({
						invalidatingFilenames: ({ event }) => event.filenames
					})
				},
				INVALIDATE_ALL: {
					target: 'syncing'
				},
				DESTROY: {
					target: 'destroyed'
				}
			}
		},
		invalidating: {
			invoke: {
				src: 'syncNotesFromOPFS',
				input: ({ context }) => ({
					store: context.store!,
					platform: context.platform,
					filenames: context.invalidatingFilenames // Only sync specific files
				}),
				onDone: [
					{
						target: 'ready',
						guard: ({ event }) => event.output.isOk(),
						actions: assign({
							invalidatingFilenames: undefined,
							error: null
						})
					},
					{
						target: 'error',
						guard: ({ event }) => event.output.isErr(),
						actions: assign({
							error: ({ event }) => `Invalidation failed: ${event.output._unsafeUnwrapErr().type}`
						})
					}
				]
			}
		},
		error: {
			on: {
				RETRY: {
					target: 'initializing',
					actions: assign({ error: null })
				},
				INVALIDATE_ALL: {
					target: 'syncing',
					actions: assign({ error: null })
				},
				DESTROY: {
					target: 'destroyed'
				}
			}
		},
		destroyed: {
			entry: ({ context }) => {
				// Cleanup resources
				if (context.persister) {
					context.persister.destroy();
				}
			},
			type: 'final'
		}
	}
});
