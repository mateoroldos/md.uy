import { isValidId } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { db } from '$lib/db';

export const prerender = false;

export const load: PageLoad = async ({ params }) => {
	const documentId = params.id;

	if (!isValidId(documentId)) {
		throw error(404, {
			message: 'Invalid Document ID'
		});
	}

	const note = await db.notes.get(documentId);

	if (!note) {
		db.notes.add({
			id: documentId,
			title: 'Untitled',
			lastEdited: Date.now()
		});
	}

	return {
		documentId
	};
};
