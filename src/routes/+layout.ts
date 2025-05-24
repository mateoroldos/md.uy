import { db } from '$lib/db';
import { getNotesLive } from '$lib/queries/notes-queries';
import type { LayoutLoad } from './$types';

export const prerender = true;
export const ssr = false;

export const load: LayoutLoad = async () => {
	return {
		notes: getNotesLive(db)
	};
};
