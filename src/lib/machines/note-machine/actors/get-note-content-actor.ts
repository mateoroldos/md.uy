import { getNoteFromOPFS } from '$lib/services/opfs';
import { fromPromise } from 'xstate';
import type { Platform } from '../note-machine';

export const getNoteContentActor = fromPromise(
	async ({ input }: { input: { platform: Platform; filename: string } }) => {
		return getNoteFromOPFS(input.filename);
	}
);
