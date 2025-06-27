import type { CachedNote } from '$lib/services/tinybase';

export const extractFilenames = (notes: CachedNote[]): Set<string> =>
	new Set(notes.map((note) => note.filename.toLowerCase()));
