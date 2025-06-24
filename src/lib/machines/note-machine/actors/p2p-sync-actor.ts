import { initYjsDocSync } from '$lib/services/yjs';
import type { ActiveUser } from '$lib/stores/webrtc-sync.svelte';
import { fromPromise } from 'xstate';
import * as Y from 'yjs';

export const p2pSyncActor = fromPromise(
	async ({ input }: { input: { id: string; ydoc: Y.Doc; activeUser: ActiveUser } }) => {
		const result = initYjsDocSync(input.id, input.ydoc);
		
		return result.match(
			({ provider }) => {
				provider.awareness.setLocalStateField('user', {
					name: input.activeUser.name,
					color: input.activeUser.color
				});
				return provider;
			},
			(error) => {
				console.error('Failed to initialize P2P sync:', error);
				throw new Error(`Failed to initialize sync: ${error.type}`);
			}
		);
	}
);
