import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { initCodemirror } from '$lib/services/codemirror';
import { error } from '@sveltejs/kit';

interface CodeMirrorOptions {
	ytext: Y.Text;
	provider: WebrtcProvider | null;
	isVisible: boolean;
}

export const codemirror = (
	node: HTMLElement,
	{ ytext, provider, isVisible }: CodeMirrorOptions
) => {
	let codemirrorResult = initCodemirror(node, ytext, provider);

	if (codemirrorResult.isErr()) {
		console.error('[CODEMIRROR_ERROR]', codemirrorResult.error.type);
		throw error(500, 'Failed to load note');
	}

	let { editorView } = codemirrorResult.value;

	let isVisibleState = $state(isVisible);

	$effect(() => {
		if (isVisibleState && editorView) {
			editorView.focus();
		}
	});

	return {
		update(options: CodeMirrorOptions) {
			isVisibleState = options.isVisible;

			if (editorView) {
				editorView.destroy();
			}

			const newResult = initCodemirror(node, options.ytext, options.provider);
			if (newResult.isErr()) {
				throw error(500, 'Failed to load note');
			}
			editorView = newResult.value.editorView;
		},
		destroy: () => {
			editorView.destroy();
		}
	};
};
