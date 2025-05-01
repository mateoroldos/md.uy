import { browser } from '$app/environment';
import { ACTIVE_USER_KEY } from '$lib/constants';
import type { User } from '$lib/types';
import randomColor from 'randomcolor';
import type { WebrtcProvider } from 'y-webrtc';

export class ActiveUser {
	activeUser = $state<User>({
		name: '',
		color: ''
	});

	constructor(username: string = 'Anonymous', provider: WebrtcProvider) {
		this.activeUser = {
			name: username,
			color: randomColor()
		};

		if (browser) {
			const item = localStorage.getItem(ACTIVE_USER_KEY);
			if (item) this.activeUser = this.deserialize(item);
		}

		$effect(() => {
			localStorage.setItem(ACTIVE_USER_KEY, this.serialize(this.activeUser));
			provider.awareness.setLocalStateField('user', {
				name: this.activeUser.name,
				color: this.activeUser.color
			});
		});
	}

	serialize(value: User): string {
		return JSON.stringify(value);
	}

	deserialize(item: string): User {
		return JSON.parse(item);
	}
}
