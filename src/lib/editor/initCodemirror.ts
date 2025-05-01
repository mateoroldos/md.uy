import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { yCollab } from 'y-codemirror.next';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';

export const initCodemirror = (node: HTMLElement, ytext: Y.Text, provider: WebrtcProvider) => {
	let editorView: EditorView;

	try {
		const undoManager = new Y.UndoManager(ytext);

		const editorState = EditorState.create({
			doc: ytext.toString(),
			extensions: [
				basicSetup,
				markdown(),
				yCollab(ytext, provider.awareness, { undoManager }),
				theme,
				EditorView.lineWrapping
			]
		});

		editorView = new EditorView({
			state: editorState,
			parent: node
		});
	} catch (err) {
		console.error('Error initializing editor:', err);
		throw err;
	}

	return { editorView };
};

const theme = EditorView.theme({
	'&': {
		height: '100%',
		fontSize: '0.92rem',
		backgroundColor: 'hsl(var(--card)) !important',
		color: 'hsl(var(--foreground)) !important'
	},
	'&.cm-focused': {
		outline: 'none'
	},
	'.cm-content': {
		fontFamily: 'var(--font-mono)',
		'padding-inline': '2rem',
		'padding-block': '1.5rem',
		'line-height': '1.6'
	},
	'.cm-gutters': {
		display: 'none'
	},
	'.cm-activeLine': {
		backgroundColor: 'transparent !important'
	},
	'.cm-activeLineGutter': {
		backgroundColor: 'transparent !important'
	},
	'.cm-focused': {
		outline: 'none'
	},
	'.cm-header': { color: '#1F2937', fontWeight: 'bold' },
	'.cm-emphasis': { fontStyle: 'italic' },
	'.cm-strong': { fontWeight: 'bold' },
	'.cm-link': { color: '#4F46E5' },
	'.cm-url': { color: '#6366F1' }
});
