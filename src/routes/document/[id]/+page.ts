import { isValidId } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
export const ssr = false;

export const load: PageLoad = ({ params }) => {
	const documentId = params.id;

	if (!isValidId(documentId)) {
		throw error(404, {
			message: 'Invalid Document ID'
		});
	}
};
