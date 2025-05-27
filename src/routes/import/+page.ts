import { createNoteWithContent } from '$lib/actions/notes-actions';
import { redirect } from '@sveltejs/kit';

export function load({ url }) {
	const content = url.searchParams.get('content');

	if (!content) {
		throw redirect(302, '/');
	}

	const newNoteId = createNoteWithContent(decodeURIComponent(content));

	redirect(302, `/${newNoteId}`);
}
