import type { Note } from '$lib/types';
import { fromPromise, ResultAsync } from 'neverthrow';

type GetNoteError = {
	type: 'GET_NOTE_ERROR';
	error: unknown;
	context: { filename: string };
};

type SaveNoteError = {
	type: 'SAVE_NOTE_ERROR';
	error: unknown;
	context: { filename: string };
};

type ListNotesError = {
	type: 'LIST_NOTES_ERROR';
	error: unknown;
};

type DeleteNoteError = {
	type: 'DELETE_NOTE_ERROR';
	error: unknown;
	context: { filename: string };
};

type RenameNoteError = {
	type: 'RENAME_NOTE_ERROR';
	error: unknown;
	context: { oldFilename: string; newFilename: string };
};

export function getNoteFromOPFS(filename: string): ResultAsync<string, GetNoteError> {
	return fromPromise(
		(async () => {
			const rootDir = await navigator.storage.getDirectory();
			const fileHandle = await rootDir.getFileHandle(filename);
			const file = await fileHandle.getFile();
			return await file.text();
		})(),
		(error) => ({ type: 'GET_NOTE_ERROR', error, context: { filename } }) as const
	);
}

export function saveNoteToOPFS(
	noteDisplayName: string,
	content: string
): ResultAsync<void, SaveNoteError> {
	return fromPromise(
		(async () => {
			const rootDir = await navigator.storage.getDirectory();
			const fileHandle = await rootDir.getFileHandle(noteDisplayName, { create: true });
			const writable = await fileHandle.createWritable();
			await writable.write(content);
			await writable.close();
		})(),
		(error) => ({ type: 'SAVE_NOTE_ERROR', error, context: { filename: noteDisplayName } }) as const
	);
}

export function listNotesFromOPFS(): ResultAsync<Note[], ListNotesError> {
	return fromPromise(
		(async () => {
			const rootDir = await navigator.storage.getDirectory();
			const notes: Note[] = [];

			// Iterate through all files in the root directory
			for await (const [name, handle] of rootDir.entries()) {
				// Only include .md files
				if (handle.kind === 'file' && name.endsWith('.md')) {
					const file = await handle.getFile();
					notes.push({
						filename: name,
						lastModified: new Date(file.lastModified),
						size: file.size
					});
				}
			}

			// Sort by last modified date (newest first)
			notes.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
			return notes;
		})(),
		(error) => ({ type: 'LIST_NOTES_ERROR', error }) as const
	);
}

export function deleteNoteFromOPFS(filename: string): ResultAsync<void, DeleteNoteError> {
	return fromPromise(
		(async () => {
			const rootDir = await navigator.storage.getDirectory();
			await rootDir.removeEntry(filename);
		})(),
		(error) => ({ type: 'DELETE_NOTE_ERROR', error, context: { filename } }) as const
	);
}

export function renameNoteInOPFS(
	oldFilename: string,
	newFilename: string
): ResultAsync<void, RenameNoteError | GetNoteError | SaveNoteError | DeleteNoteError> {
	const getContent = getNoteFromOPFS(oldFilename);
	const saveAndDelete = (content: string) =>
		saveNoteToOPFS(newFilename, content).andThen(() => deleteNoteFromOPFS(oldFilename));

	return getContent
		.andThen(saveAndDelete)
		.mapErr(
			(error) =>
				({ type: 'RENAME_NOTE_ERROR', error, context: { oldFilename, newFilename } }) as const
		);
}
