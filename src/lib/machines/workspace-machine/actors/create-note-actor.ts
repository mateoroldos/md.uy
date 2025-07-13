import { createFileSystemWithFallback } from '$lib/services/filesystem';
import type { CachedNote } from '$lib/services/tinybase';
import { extractFilenames } from '$lib/utils/extract-filenames';
import { generateUniqueFilename } from '$lib/utils/generate-unique-filename';
import { fromPromise } from 'xstate';

export const createNoteActor = fromPromise(
	async ({ input }: { input: { existingNotes: CachedNote[]; filename?: string } }) => {
		const existingFilenames = extractFilenames(input.existingNotes);
		const fs = createFileSystemWithFallback();

		return await generateUniqueFilename(input.filename, existingFilenames).asyncAndThen(
			(filename) => fs.writeFile(filename, '')
		);
	}
);
