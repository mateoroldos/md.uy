import { saveNoteToOPFS } from '$lib/services/opfs';
import type { CachedNote } from '$lib/services/tinybase';
import { extractFilenames } from '$lib/utils/extract-filenames';
import { generateUniqueFilename } from '$lib/utils/generate-unique-filename';
import { fromPromise } from 'xstate';

export const createNoteActor = fromPromise(
	async ({ input }: { input: { existingNotes: CachedNote[]; filename?: string } }) => {
		const existingFilenames = extractFilenames(input.existingNotes);

		return await generateUniqueFilename(input.filename, existingFilenames).asyncAndThen(
			(filename) => saveNoteToOPFS(filename, '')
		);
	}
);
