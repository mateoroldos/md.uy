import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { env } from '$env/dynamic/public';
import { Y_TEXT_KEY } from '$lib/constants';

export const initYjsDoc = (content: string) => {
	const ydoc = new Y.Doc();
	const ytext = ydoc.getText(Y_TEXT_KEY);

	if (content) {
		ytext.insert(0, content);
	}

	const cleanup = () => {
		if (ydoc) {
			ydoc.destroy();
		}
	};

	return { ydoc, ytext, cleanup };
};

export const initYjsDocSync = (id: string, ydoc: Y.Doc) => {
	const provider = new WebrtcProvider(id, ydoc, {
		signaling: [
			env.PUBLIC_SIGNALING_SERVER ?? 'https://y-webrtc-cloudflare.mateoroldos19.workers.dev'
		]
	});

	return {
		provider
	};
};
