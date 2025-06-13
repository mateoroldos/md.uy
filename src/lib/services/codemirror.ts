import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { yCollab } from 'y-codemirror.next';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';

export const initCodemirror = (
	node: HTMLElement,
	ytext: Y.Text,
	provider: WebrtcProvider | null
) => {
	let editorView: EditorView;

	try {
		const undoManager = new Y.UndoManager(ytext);

		const extensions = [basicSetup, markdown(), theme, EditorView.lineWrapping];

		if (provider) {
			extensions.push(yCollab(ytext, provider.awareness, { undoManager }));
		} else {
			extensions.push(yCollab(ytext, null, { undoManager }));
		}

		const editorState = EditorState.create({
			doc: ytext.toString(),
			extensions
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
		backgroundColor: 'var(--card)',
		color: 'var(--foreground)'
	},
	'&.cm-focused': {
		outline: 'none'
	},
	'&.cm-focused .cm-cursor': {
		borderLeftColor: 'var(--foreground)'
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
	'.ͼ7.ͼ5': { color: 'var(--foreground)' },
	'.ͼ6.ͼc': { color: 'oklch(var(--primary))' },
	'.ͼ5.ͼ6': { color: 'oklch(var(--muted-foreground))' },
	'.ͼ7': { fontWeight: '500' }
});
