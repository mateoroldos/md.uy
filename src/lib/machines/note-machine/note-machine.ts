import { renameNoteInOPFS } from '$lib/services/opfs';
import { setup, assign } from 'xstate';
import * as Y from 'yjs';
import { autoSaveActor } from './actors/auto-save-actor';
import { initYjsDocActor } from './actors/init-doc-actor';
import { getNoteContentActor } from './actors/get-note-content-actor';
import { p2pSyncActor } from './actors/p2p-sync-actor';
import type { WebrtcProvider } from 'y-webrtc';
import { ActiveUser } from '$lib/stores/webrtc-sync.svelte';

interface NoteContext {
	filename: string;
	platform: Platform;
	initialContent: string;
	ydoc: Y.Doc | null;
	ytext: Y.Text | null;
	syncProvider: WebrtcProvider | null;
	user: ActiveUser;
	error: string | null;
}

export type Platform = 'web' | 'desktop';

export const noteMachine = setup({
	types: {
		context: {} as NoteContext,
		events: {} as
			| {
					type: 'SET_FILE_NAME';
					value: string;
			  }
			| {
					type: 'TOGGLE_SYNC';
			  }
			| {
					type: 'RETRY';
			  },
		input: {} as {
			filename: string;
		}
	},
	actors: {
		getNoteContent: getNoteContentActor,
		initYjsDoc: initYjsDocActor,
		autoSave: autoSaveActor,
		p2pSync: p2pSyncActor
	},
	actions: {
		setFilename: async (
			_,
			params: {
				oldFilename: string;
				newFilename: string;
			}
		) => {
			const result = await renameNoteInOPFS(params.oldFilename, params.newFilename);
			result.match(
				() => {
					assign({ filename: params.newFilename });
				},
				(error) => {
					console.error('Failed to rename note:', error);
					// Note: In a real implementation, you might want to show this error to the user
				}
			);
		}
	}
}).createMachine({
	id: 'note',
	initial: 'fetching',
	context: ({ input }) => ({
		filename: input.filename,
		platform: 'web',
		initialContent: '',
		ydoc: null,
		ytext: null,
		syncProvider: null,
		user: new ActiveUser(),
		error: null
	}),
	states: {
		fetching: {
			description: 'Load note from OPFS or FS',
			invoke: {
				src: 'getNoteContent',
				input: ({ context: { filename, platform } }) => ({
					platform,
					filename
				}),
				onDone: {
					target: 'initializing',
					actions: assign({ 
						initialContent: ({ event }) => event.output,
						error: null
					})
				},
				onError: {
					target: 'error',
					actions: assign({
						error: ({ event }) => `Failed to load note: ${event.error?.message || 'Unknown error'}`
					})
				}
			}
		},
		initializing: {
			description: 'Initialize Yjs document',
			invoke: {
				src: 'initYjsDoc',
				input: ({ context: { initialContent } }) => ({
					initialContent
				}),
				onDone: {
					target: 'active',
					actions: assign({
						ydoc: ({ event }) => event.output.ydoc,
						ytext: ({ event }) => event.output.ytext,
						error: null
					})
				},
				onError: {
					target: 'error',
					actions: assign({
						error: ({ event }) => `Failed to initialize document: ${event.error?.message || 'Unknown error'}`
					})
				}
			}
		},
		active: {
			initial: 'local',
			invoke: {
				src: 'autoSave',
				input: ({ context: { ytext, filename } }) => ({
					ytext: ytext as Y.Text,
					filename
				})
			},
			on: {
				SET_FILE_NAME: {
					actions: {
						type: 'setFilename',
						params: ({ context, event }) => ({
							oldFilename: context.filename,
							newFilename: event.value
						})
					}
				}
			},
			states: {
				local: {
					on: {
						TOGGLE_SYNC: 'sync'
					}
				},
				sync: {
					description: 'Sync session initialized',
					on: {
						TOGGLE_SYNC: 'local'
					},
					invoke: {
						src: 'p2pSync',
						input: ({ context: { filename, ydoc, user } }) => ({
							id: filename,
							ydoc: ydoc as Y.Doc,
							activeUser: user
						}),
						onDone: {
							actions: assign({
								syncProvider: ({ event }) => event.output
							})
						},
						onError: {
							target: 'local',
							actions: assign({
								error: ({ event }) => `Sync failed: ${event.error?.message || 'Unknown error'}`
							})
						}
					}
				}
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
