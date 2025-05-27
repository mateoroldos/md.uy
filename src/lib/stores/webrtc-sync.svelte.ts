import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import { env } from '$env/dynamic/public';
import { page } from '$app/state';
import { replaceState } from '$app/navigation';

export class WebrtcSync {
	isSyncing = $state<boolean>(false);
	provider = $state<WebrtcProvider | null>(null);
	private queryParamName = 'sync';

	constructor(id: string, ydoc: Y.Doc) {
		const urlParams = new URLSearchParams(window.location.search);
		const syncParam = urlParams.get(this.queryParamName);
		if (syncParam === 'true') {
			this.isSyncing = true;
		}

		$effect(() => {
			if (page.params.id) {
				const syncParam = page.url.searchParams.get(this.queryParamName);
				if (syncParam === 'true') {
					this.isSyncing = true;
				} else if (syncParam !== 'true' || syncParam === null) {
					this.isSyncing = false;
				}
			}
		});

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

		const url = new URL(window.location.href);
		if (this.isSyncing) {
			url.searchParams.set(this.queryParamName, 'true');
		} else {
			url.searchParams.delete(this.queryParamName);
		}
		replaceState(url, {});
	};
}
