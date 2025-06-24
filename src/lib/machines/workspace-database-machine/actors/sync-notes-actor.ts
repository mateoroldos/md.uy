import type { Note, Platform } from '$lib/types';
import { fromPromise } from 'xstate';
import { getNoteFromOPFS, listNotesFromOPFS } from '$lib/services/opfs';
import { parseNoteFrontmatter } from '$lib/utils/markdown-parsing';
import { ok, err, type Result } from 'neverthrow';
import type { NotesCacheDatabase, CachedNote } from '$lib/services/tinybase';

type SyncNotesError = {
	type: 'SYNC_NOTES_ERROR';
	error: unknown;
	context?: { phase?: string };
};

type SyncNotesResult = {
	updatedCount: number;
	skippedCount: number;
	totalFiles: number;
};

export const syncNotesFromOPFSActor = fromPromise(
	async ({
		input
	}: {
		input: {
			store: NotesCacheDatabase;
			platform: Platform;
		};
	}): Promise<Result<SyncNotesResult, SyncNotesError>> => {
		const { store } = input;

		const notesResult = await listNotesFromOPFS();
		const notes = notesResult.match(
			(notesList) => notesList,
			(error) => {
				console.error('Failed to list notes:', error);
				return null;
			}
		);

		if (!notes) {
			return err({
				type: 'SYNC_NOTES_ERROR',
				error: 'Failed to list notes from OPFS',
				context: { phase: 'list_notes' }
			});
		}

		const updates: Record<string, CachedNote & { tags: string[] }> = {};
		const filesToRead: Note[] = [];
		let skippedCount = 0;

		// First pass: identify which files need to be read
		for (const note of notes) {
			const existingModified = store.getCell('notes', note.filename, 'modified') as number;
			const noteModified = note.lastModified.getTime();

			// Only read files that are new or have been modified
			if (!existingModified || noteModified > existingModified) {
				filesToRead.push(note);
			} else {
				skippedCount++;
			}
		}

		console.log(
			`Sync optimization: Reading ${filesToRead.length} files, skipping ${skippedCount} unchanged files`
		);

		// Second pass: read and parse only the necessary files
		for (const note of filesToRead) {
			const contentResult = await getNoteFromOPFS(note.filename);

			contentResult.match(
				(content) => {
					const parseResult = parseNoteFrontmatter(note.filename, content, note.lastModified);

					parseResult.match(
						(parsedNote) => {
							const noteUpdate: CachedNote & { tags: string[] } = {
								favorite: parsedNote.metadata.favorite || false,
								title: parsedNote.metadata.title || note.filename.replace('.md', ''),
								modified: note.lastModified.getTime(),
								created: parsedNote.metadata.created || note.lastModified.getTime(),
								tags: parsedNote.tags
							};

							updates[note.filename] = noteUpdate;
						},
						(error) => {
							console.warn(`Failed to parse frontmatter for ${note.filename}:`, error);
							// Create basic note entry even if parsing fails
							updates[note.filename] = {
								favorite: false,
								title: note.filename,
								modified: note.lastModified.getTime(),
								created: note.lastModified.getTime(),
								tags: []
							};
						}
					);
				},
				(error) => {
					console.warn(`Failed to read content for ${note.filename}:`, error);
				}
			);
		}

		// Helper function to create tag ID from tag name
		const createTagId = (tagName: string): string => {
			return tagName
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
		};

		// Batch update the store
		store.transaction(() => {
			// 1. Update notes (without tags field)
			Object.entries(updates).forEach(([filename, noteUpdate]) => {
				store.setRow('notes', filename, {
					title: noteUpdate.title,
					favorite: noteUpdate.favorite,
					modified: noteUpdate.modified,
					created: noteUpdate.created
				});
			});

			// 2. Process tags and relationships
			Object.entries(updates).forEach(([filename, noteUpdate]) => {
				// Remove existing tag relationships for this note
				store.getRowIds('noteTags').forEach((relationId: string) => {
					if (store.getCell('noteTags', relationId, 'noteId') === filename) {
						store.delRow('noteTags', relationId);
					}
				});

				// Add new tags and relationships
				noteUpdate.tags.forEach((tagName) => {
					const tagId = createTagId(tagName);

					// Ensure tag exists in tags table
					if (!store.getRow('tags', tagId)) {
						store.setRow('tags', tagId, {
							name: tagName,
							color: '#gray',
							created: Date.now()
						});
					}

					// Create note-tag relationship
					const relationId = `${filename}:${tagId}`;
					store.setRow('noteTags', relationId, {
						noteId: filename,
						tagId: tagId
					});
				});
			});

			// 3. Remove notes that no longer exist in OPFS
			const existingFileNames = new Set(notes.map((n) => n.filename));
			store.getRowIds('notes').forEach((rowId: string) => {
				if (!existingFileNames.has(rowId)) {
					// Clean up note-tag relationships first
					store.getRowIds('noteTags').forEach((relationId: string) => {
						if (store.getCell('noteTags', relationId, 'noteId') === rowId) {
							store.delRow('noteTags', relationId);
						}
					});
					// Remove the note
					store.delRow('notes', rowId);
				}
			});
		});

		console.log('a', updates, skippedCount, notes);
		return ok({
			updatedCount: Object.keys(updates).length,
			skippedCount,
			totalFiles: notes.length
		});
	}
);
