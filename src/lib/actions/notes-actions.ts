import type { Note, db as database } from '$lib/db';
import { generateId } from '$lib/utils';

export const createNote = (documentId: string, db: typeof database) => {
	try {
		db.notes.add({
			id: documentId,
			title: 'Untitled',
			lastEdited: Date.now(),
			isPinned: false,
			isFavorite: false
		});
	} catch (error) {
		console.error('Failed to create note:', error);
	}
};

export const deleteNote = async (noteId: string, db: typeof database) => {
	try {
		await db.notes.delete(noteId);
		await deleteYjsData(noteId);
	} catch (error) {
		console.error('Failed to delete note:', error);
	}
};

export const togglePin = async (note: Note, db: typeof database) => {
	try {
		await db.notes.update(note.id, {
			isPinned: !note.isPinned,
			lastEdited: Date.now()
		});
	} catch (error) {
		console.error('Failed to toggle pin:', error);
	}
};

export const toggleFavorite = async (note: Note, db: typeof database) => {
	try {
		await db.notes.update(note.id, {
			isFavorite: !note.isFavorite,
			lastEdited: Date.now()
		});
	} catch (error) {
		console.error('Failed to toggle favorite:', error);
	}
};

export const updateTitle = async (noteId: string, title: string, db: typeof database) => {
	try {
		await db.notes.update(noteId, {
			title,
			lastEdited: Date.now()
		});
	} catch (error) {
		console.error('Failed to update title:', error);
	}
};

export const updateLastEdited = async (noteId: string, db: typeof database) => {
	try {
		await db.notes.update(noteId, { lastEdited: Date.now() });
	} catch (error) {
		console.error('Failed to update last edited timestamp:', error);
	}
};

export const createNoteWithContent = (content: string) => {
	const newDocId = generateId();
	sessionStorage.setItem(`import-${newDocId}`, content);

	return newDocId;
};

export const deleteYjsData = async (documentId: string) => {
	try {
		const request = indexedDB.deleteDatabase(documentId);

		return new Promise<void>((resolve, reject) => {
			request.onerror = () => {
				console.error(`Failed to delete YJS data for document: ${documentId}`);
				reject(new Error(`Failed to delete YJS data for document: ${documentId}`));
			};

			request.onsuccess = () => {
				console.log(`Successfully deleted YJS data for document: ${documentId}`);
				resolve();
			};
		});
	} catch (error) {
		console.error('Failed to delete YJS data:', error);
		throw error;
	}
};
