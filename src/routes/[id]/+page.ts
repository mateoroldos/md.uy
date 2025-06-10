import { isValidId } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { db } from '$lib/db';
import { createNote } from '$lib/actions/notes-actions';
import { getNote } from '$lib/queries/notes-queries';
import { initYjs } from '$lib/editor/initYjs';

export const prerender = false;

export const load: PageLoad = async ({ params }) => {
	const noteId = params.id;

	if (!isValidId(noteId)) {
		throw error(404, {
			message: 'Invalid Document ID'
		});
	}

	const note = await getNote(noteId, db);

	if (!note) {
		createNote(noteId, db);
	}

	const { ydoc, ytext, cleanup } = await initYjs(noteId);

	return {
		noteId,
		ydoc,
		ytext,
		cleanup
	};
};
