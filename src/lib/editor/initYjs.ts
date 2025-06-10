import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';
import { Y_TEXT_KEY } from '$lib/constants';

export const initYjs = (
	id: string
): Promise<{
	ydoc: Y.Doc;
	persistance: IndexeddbPersistence;
	ytext: Y.Text;
	cleanup: () => void;
}> => {
	return new Promise((resolve) => {
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

		// Wait for IndexedDB to sync before resolving
		persistance.on('synced', () => {
			resolve({ ydoc, persistance, ytext, cleanup });
		});
	});
};
