import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { initCodemirror } from '../editor/initCodemirror';

interface CodeMirrorOptions {
	ytext: Y.Text;
	provider: WebrtcProvider | null;
	isVisible: boolean;
}

export const codemirror = (
	node: HTMLElement,
	{ ytext, provider, isVisible }: CodeMirrorOptions
) => {
	let { editorView } = initCodemirror(node, ytext, provider);

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

			editorView = initCodemirror(node, ytext, provider).editorView;
		},
		destroy: () => {
			editorView.destroy();
		}
	};
};
