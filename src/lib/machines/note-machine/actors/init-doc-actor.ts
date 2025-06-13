import { initYjsDoc } from '$lib/services/yjs';
import { fromPromise } from 'xstate';

export const initYjsDocActor = fromPromise(
	async ({ input }: { input: { initialContent: string } }) => {
		return initYjsDoc(input.initialContent);
	}
);
