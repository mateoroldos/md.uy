import { ACTIVE_USER_KEY } from '$lib/constants';
import type { User } from '$lib/types';
import randomColor from 'randomcolor';

export class ActiveUser implements User {
	name = $state('');
	color = $state('');

	constructor(username: string = 'Anonymous') {
		this.name = username;
		this.color = randomColor();

		const item = localStorage.getItem(ACTIVE_USER_KEY);
		if (item) {
			const { name, color } = this.deserialize(item);

			this.name = name;
			this.color = color;
		}

		$effect(() => {
			localStorage.setItem(ACTIVE_USER_KEY, this.serialize({ name: this.name, color: this.color }));
		});
	}

	serialize(value: User): string {
		return JSON.stringify(value);
	}

	deserialize(item: string): User {
		return JSON.parse(item);
	}
}
