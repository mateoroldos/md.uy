import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import { env } from '$env/dynamic/public';
import { page } from '$app/state';
import { replaceState } from '$app/navigation';
import { browser } from '$app/environment';
import { ACTIVE_USER_KEY } from '$lib/constants';
import type { User } from '$lib/types';
import randomColor from 'randomcolor';

export class WebrtcSync {
	isSyncing = $state<boolean>(false);
	provider = $state<WebrtcProvider | null>(null);
	activeUser = $state<User>({
		name: '',
		color: ''
	});
	private queryParamName = 'sync';

	constructor(id: string, ydoc: Y.Doc, username: string = 'Anonymous') {
		// Initialize active user
		this.activeUser = {
			name: username,
			color: randomColor()
		};

		if (browser) {
			const item = localStorage.getItem(ACTIVE_USER_KEY);
			if (item) this.activeUser = this.deserialize(item);
		}

		// Initialize sync state from URL
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

		$effect(() => {
			localStorage.setItem(ACTIVE_USER_KEY, this.serialize(this.activeUser));
			if (this.provider) {
				this.provider.awareness.setLocalStateField('user', {
					name: this.activeUser.name,
					color: this.activeUser.color
				});
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

	serialize(value: User): string {
		return JSON.stringify(value);
	}

	deserialize(item: string): User {
		return JSON.parse(item);
	}
}
