import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { yCollab } from 'y-codemirror.next';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, type Extension } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { fromThrowable, Result } from 'neverthrow';

type UndoManagerError = {
	type: 'UNDO_MANAGER_ERROR';
	error: unknown;
	context?: { ytext: Y.Text };
};

type EditorStateError = {
	type: 'EDITOR_STATE_ERROR';
	error: unknown;
	context?: { extensions: Extension[] };
};

type EditorViewError = {
	type: 'EDITOR_VIEW_ERROR';
	error: unknown;
	context?: { parent: HTMLElement };
};

type CodeMirrorError = UndoManagerError | EditorStateError | EditorViewError;

export const initCodemirror = (
	node: HTMLElement,
	ytext: Y.Text,
	provider: WebrtcProvider | null
): Result<{ editorView: EditorView }, CodeMirrorError> => {
	return safeCreateUndoManager(ytext).andThen((undoManager) => {
		const extensions = [basicSetup, markdown(), theme, EditorView.lineWrapping];

		if (provider) {
			extensions.push(yCollab(ytext, provider.awareness, { undoManager }));
		} else {
			extensions.push(yCollab(ytext, null, { undoManager }));
		}

		return safeCreateEditorState(ytext, extensions).andThen((editorState) =>
			safeCreateEditorView(editorState, node).map((editorView) => ({ editorView }))
		);
	});
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

const safeCreateUndoManager = (ytext: Y.Text): Result<Y.UndoManager, UndoManagerError> => {
	return fromThrowable(
		() => new Y.UndoManager(ytext),
		(error) => ({ type: 'UNDO_MANAGER_ERROR', error, context: { ytext } }) as const
	)();
};

const safeCreateEditorState = (ytext: Y.Text, extensions: Extension[]): Result<EditorState, EditorStateError> => {
	return fromThrowable(
		() =>
			EditorState.create({
				doc: ytext.toString(),
				extensions
			}),
		(error) => ({ type: 'EDITOR_STATE_ERROR', error, context: { extensions } }) as const
	)();
};

const safeCreateEditorView = (state: EditorState, parent: HTMLElement): Result<EditorView, EditorViewError> => {
	return fromThrowable(
		() =>
			new EditorView({
				state,
				parent
			}),
		(error) => ({ type: 'EDITOR_VIEW_ERROR', error, context: { parent } }) as const
	)();
};
