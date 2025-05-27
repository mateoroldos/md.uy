import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import { env } from '$env/dynamic/public';

export class WebrtcSync {
	isSyncing = $state<boolean>(false);
	provider = $state<WebrtcProvider | null>(null);

	constructor(id: string, ydoc: Y.Doc) {
		$effect(() => {
			if (this.isSyncing && !this.provider) {
				this.provider = new WebrtcProvider(id, ydoc, {
					signaling: [
						env.PUBLIC_SIGNALING_SERVER ?? 'https://y-webrtc-cloudflare.mateoroldos19.workers.dev'
					]
				});
			} else if (!this.isSyncing && this.provider) {
				this.provider.destroy();
				this.provider = null;
			}
		});
	}

	toggleSync = () => {
		this.isSyncing = !this.isSyncing;
	};
}
