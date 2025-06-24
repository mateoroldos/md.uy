import { setup, assign } from 'xstate';
import type { Note, Platform, User } from '$lib/types';
import { workspaceCacheMachine } from '../workspace-database-machine/workspace-database-machine';
import type { CachedNote } from '$lib/services/tinybase';

interface WorkspaceContext {
	platform: Platform;
	notes: CachedNote[];
	user: User;
	error: string | null;
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
					type: 'CACHE_READY';
					notes: CachedNote[];
			  }
			| {
					type: 'RETRY';
			  }
	},
	actors: {
		workspaceCache: workspaceCacheMachine
	}
}).createMachine({
	context: {
		platform: 'web',
		notes: [],
		user: {
			name: '',
			color: ''
		},
		error: null
	},
	initial: 'fetching',
	states: {
		fetching: {
			description: 'Load notes from OPFS or FS',
			invoke: {
				src: 'workspaceCache',
				input: ({ self, context: { platform } }) => ({
					platform,
					parentRef: self
				})
			},
			on: {
				CACHE_READY: {
					actions: assign({ notes: ({ event }) => event.notes }),
					target: 'ready'
				}
			}
		},
		ready: {},
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
