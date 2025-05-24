import type { db as database } from '$lib/db';
import { liveQuery } from 'dexie';

export const getNote = async (documentId: string, db: typeof database) => {
	try {
		const note = await db.notes.get(documentId);
		return note;
	} catch (error) {
		console.error('Failed to get note:', error);
	}
};

export const getNoteLive = (documentId: string, db: typeof database) => {
	return liveQuery(() => {
		try {
			return db.notes.get(documentId);
		} catch (error) {
			console.error('Failed to get note live:', error);
			throw error;
		}
	});
};

export const getNotesLive = (db: typeof database) => {
	return liveQuery(() => {
		try {
			return db.notes.toArray();
		} catch (error) {
			console.error('Failed to get notes live:', error);
			throw error;
		}
	});
};
