export const ssr = false;

import { redirect } from '@sveltejs/kit';
import { generateId } from '$lib/utils';

export function load() {
	const newDocumentId = generateId();
	throw redirect(307, `/${newDocumentId}`);
}
