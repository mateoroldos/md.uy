import { initYjsDoc } from '$lib/services/yjs';
import { fromPromise } from 'xstate';

export const initYjsDocActor = fromPromise(
	async ({ input }: { input: { initialContent: string } }) => {
		const result = initYjsDoc(input.initialContent);
		
		return result.match(
			(data) => data,
			(error) => {
				console.error('Failed to initialize Yjs document:', error);
				throw new Error(`Failed to initialize document: ${error.type}`);
			}
		);
	}
);
