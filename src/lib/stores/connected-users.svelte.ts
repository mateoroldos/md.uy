import type { User } from '$lib/types';
import type { WebrtcProvider } from 'y-webrtc';

export class ConnectedUsers {
	users = $state<User[]>([]);

	constructor(provider: WebrtcProvider) {
		provider.awareness.on('change', () => {
			const stateMap = provider.awareness.getStates() as Map<number, { [clientId: string]: User }>;
			const userSet = new Set<User>();

			stateMap.forEach((state, clientId) => {
				if (clientId !== provider.awareness.clientID && state.user) {
					userSet.add(state.user);
				}
			});

			this.users.length = 0;
			Array.from(userSet).forEach((user) => {
				this.users.push(user);
			});
		});
	}
}
