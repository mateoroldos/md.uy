import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';
import { Y_TEXT_KEY } from '$lib/constants';

export const initYjs = (id: string) => {
	const ydoc = new Y.Doc();

	const provider = new WebrtcProvider(id, ydoc, {
		signaling: [import.meta.env.VITE_SIGNALING_SERVER ?? 'http://localhost:8787']
	});
	const persistance = new IndexeddbPersistence(id, ydoc);

	const ytext = ydoc.getText(Y_TEXT_KEY);

	const cleanup = () => {
		if (ydoc) {
			ydoc.destroy();
		}
		if (provider) {
			provider.destroy();
		}
		if (persistance) {
			persistance.destroy();
		}
	};

	return { ydoc, provider, persistance, ytext, cleanup };
};
