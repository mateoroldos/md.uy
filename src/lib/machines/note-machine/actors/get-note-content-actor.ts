import { createFileSystemWithFallback } from '$lib/services/filesystem';
import { fromPromise } from 'xstate';
import type { Platform } from '../note-machine';

export const getNoteContentActor = fromPromise(
	async ({ input }: { input: { platform: Platform; filename: string } }) => {
		const fs = createFileSystemWithFallback();
		const result = await fs.readFile(input.filename);
		
		return result.match(
			(content) => content,
			(error) => {
				console.error('Failed to get note content:', error);
				throw new Error(`Failed to load note: ${error.type}`);
			}
		);
	}
);
