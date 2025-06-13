import { listNotesFromOPFS } from '$lib/services/opfs';
import type { LayoutLoad } from './$types';

export const prerender = true;
export const ssr = false;

export const load: LayoutLoad = async () => {
	return {
		notes: await listNotesFromOPFS()
	};
};
