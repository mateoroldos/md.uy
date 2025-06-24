import { saveNoteToOPFS } from '$lib/services/opfs';
import debounce from 'debounce';
import { fromCallback } from 'xstate';
import * as Y from 'yjs';

export const autoSaveActor = fromCallback<
	// Event types that can be sent back to parent
	{ type: 'SAVE_SUCCESS'; note: string } | { type: 'SAVE_ERROR'; error: unknown },
	// Input type
	{ ytext: Y.Text; filename: string }
>(({ input, sendBack }) => {
	const { ytext, filename } = input;

	const debouncedSave = debounce(async (content: string) => {
		const result = await saveNoteToOPFS(filename, content);
		
		result.match(
			() => {
				sendBack({ type: 'SAVE_SUCCESS', note: content });
			},
			(error) => {
				console.error('Auto-save failed:', error);
				sendBack({ type: 'SAVE_ERROR', error });
			}
		);
	}, 700);

	const observer = () => {
		const currentContent = ytext.toString();
		debouncedSave(currentContent);
	};

	ytext.observe(observer);

	return () => {
		ytext.unobserve(observer);
		debouncedSave.flush();
	};
});
