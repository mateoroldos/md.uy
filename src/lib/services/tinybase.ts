import { createStore, type Store } from 'tinybase/with-schemas';
import { createIndexedDbPersister } from 'tinybase/persisters/persister-indexed-db';
import { fromPromise, ResultAsync } from 'neverthrow';

const createNotesStore = () =>
	createStore().setTablesSchema({
		notes: {
			favorite: { type: 'boolean', default: false },
			title: { type: 'string', default: 'Untitled' },
			modified: { type: 'number' },
			created: { type: 'number', default: Date.now() }
		},
		tags: {
			name: { type: 'string' },
			color: { type: 'string', default: '#gray' },
			created: { type: 'number', default: Date.now() }
		},
		noteTags: {
			noteId: { type: 'string' },
			tagId: { type: 'string' }
		}
	});

type DatabaseInitError = {
	type: 'DATABASE_INIT_ERROR';
	error: unknown;
	context: { workspaceId: string };
};
export type DatabaseInitResult = {
	store: NotesCacheDatabase;
	persister: ReturnType<typeof createIndexedDbPersister>;
};

export const initNotesDatabase = (
	workspaceId: string
): ResultAsync<DatabaseInitResult, DatabaseInitError> => {
	return fromPromise(
		(async (): Promise<DatabaseInitResult> => {
			const store = createNotesStore();
			const persister = createIndexedDbPersister(store, `notes-db-${workspaceId}`);

			await persister.load();
			await persister.startAutoSave();

			return { store, persister };
		})(),
		(error): DatabaseInitError => ({
			type: 'DATABASE_INIT_ERROR',
			error,
			context: { workspaceId }
		})
	);
};

export type NotesCacheDatabase = ReturnType<typeof createNotesStore>;

export type CachedNote = {
	filename: string;
	favorite: boolean;
	title: string;
	modified: number;
	created: number;
};

export type CachedTag = {
	name: string;
	color: string;
	created: number;
};

export type CachedNoteTag = {
	noteId: string;
	tagId: string;
};
