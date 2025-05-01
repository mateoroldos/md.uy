import type { Shortcut } from '$lib/keymap/keymap';

export const shortcut = (node: HTMLElement, params?: Shortcut) => {
	if (!params) return;

	const handler = (e: KeyboardEvent) => {
		if (
			!!params.alt === e.altKey &&
			!!params.shift === e.shiftKey &&
			!!params.control === (e.ctrlKey || e.metaKey) &&
			params.code === e.code
		) {
			e.preventDefault();
			node.click();
		}
	};

	window.addEventListener('keydown', handler);

	return {
		destroy: () => {
			window.removeEventListener('keydown', handler);
		}
	};
};
