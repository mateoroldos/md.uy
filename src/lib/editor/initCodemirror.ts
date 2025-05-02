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
		backgroundColor: 'hsl(var(--card))',
		color: 'hsl(var(--foreground))'
	},
	'&.cm-focused': {
		outline: 'none'
	},
	'&.cm-focused .cm-cursor': {
		borderLeftColor: 'hsl(var(--foreground))'
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
		backgroundColor: 'transparent'
	},
	'.cm-activeLineGutter': {
		backgroundColor: 'transparent'
	},
	'.ͼ7.ͼ5': { color: 'hsl(var(--foreground))' },
	'.ͼ6.ͼc': { color: 'hsl(var(--primary))' },
	'.ͼ5.ͼ6': { color: 'hsl(var(--muted-foreground))' },
	'.ͼ7': { fontWeight: '500' }
});
