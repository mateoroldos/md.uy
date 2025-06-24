import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { env } from '$env/dynamic/public';
import { Y_TEXT_KEY } from '$lib/constants';
import { fromThrowable, Result } from 'neverthrow';

type YjsDocError = {
	type: 'YJS_DOC_ERROR';
	error: unknown;
	context: { content: string };
};

type YjsSyncError = {
	type: 'YJS_SYNC_ERROR';
	error: unknown;
	context: { id: string; signalingServer: string };
};

export const initYjsDoc = (content: string): Result<{ ydoc: Y.Doc; ytext: Y.Text; cleanup: () => void }, YjsDocError> => {
	return fromThrowable(
		() => {
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
		},
		(error) => ({ type: 'YJS_DOC_ERROR', error, context: { content } }) as const
	)();
};

export const initYjsDocSync = (id: string, ydoc: Y.Doc): Result<{ provider: WebrtcProvider }, YjsSyncError> => {
	return fromThrowable(
		() => {
			const signalingServer = env.PUBLIC_SIGNALING_SERVER ?? 'https://y-webrtc-cloudflare.mateoroldos19.workers.dev';
			const provider = new WebrtcProvider(id, ydoc, {
				signaling: [signalingServer]
			});

			return { provider };
		},
		(error) => ({ 
			type: 'YJS_SYNC_ERROR', 
			error, 
			context: { 
				id, 
				signalingServer: env.PUBLIC_SIGNALING_SERVER ?? 'https://y-webrtc-cloudflare.mateoroldos19.workers.dev'
			} 
		}) as const
	)();
};
