import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { env } from '$env/dynamic/public';

export const initSync = (id: string, ydoc: Y.Doc) => {
	const provider = new WebrtcProvider(id, ydoc, {
		signaling: [
			env.PUBLIC_SIGNALING_SERVER ?? 'https://y-webrtc-cloudflare.mateoroldos19.workers.dev'
		]
	});

	return {
		provider
	};
};
