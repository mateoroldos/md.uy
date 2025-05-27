import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';
import { Y_TEXT_KEY } from '$lib/constants';

export const initYjs = (id: string) => {
	const ydoc = new Y.Doc();

	const persistance = new IndexeddbPersistence(id, ydoc);

	const ytext = ydoc.getText(Y_TEXT_KEY);

	const cleanup = () => {
		if (ydoc) {
			ydoc.destroy();
		}
		if (persistance) {
			persistance.destroy();
		}
	};

	return { ydoc, persistance, ytext, cleanup };
};
