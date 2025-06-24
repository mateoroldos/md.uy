import { getNoteFromOPFS } from '$lib/services/opfs';
import { fromPromise } from 'xstate';
import type { Platform } from '../note-machine';

export const getNoteContentActor = fromPromise(
	async ({ input }: { input: { platform: Platform; filename: string } }) => {
		const result = await getNoteFromOPFS(input.filename);
		
		return result.match(
			(content) => content,
			(error) => {
				console.error('Failed to get note content:', error);
				throw new Error(`Failed to load note: ${error.type}`);
			}
		);
	}
);
