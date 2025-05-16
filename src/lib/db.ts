import Dexie, { type EntityTable } from 'dexie';

interface Note {
	id: string;
	title: string;
	lastEdited: number;
	isFavorite: boolean;
	isPinned: boolean;
}

const db = new Dexie('NotesDatabase') as Dexie & {
	notes: EntityTable<Note, 'id'>;
};

db.version(1).stores({
	notes: '++id, title, lastEdited'
});

db.version(2).stores({
	notes: '++id, title, lastEdited, isFavorite, isPinned'
});

export type { Note };
export { db };
