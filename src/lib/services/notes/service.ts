import { fromPromise, ResultAsync, ok, err } from 'neverthrow';
import { nanoid } from 'nanoid';
import type { FileSystem } from '../filesystem';
import type {
	Note,
	NoteService,
	CreateNoteData,
	UpdateNoteData,
	NoteServiceError
} from './types';
import { createNoteServiceError } from './types';

/**
 * Note metadata structure for JSON storage
 */
interface NoteFileData {
	id: string;
	filename: string;
	content: string;
	lastModified: string;
	size: number;
	metadata?: Record<string, unknown>;
}

/**
 * Higher-order function that creates a note service using the provided FileSystem
 */
export function createNoteService(fileSystem: FileSystem): NoteService {
	const NOTES_EXTENSION = '.md';
	const METADATA_EXTENSION = '.meta.json';

	/**
	 * Validate note filename
	 */
	function validateFilename(filename: string): ResultAsync<string, NoteServiceError> {
		if (!filename || filename.trim().length === 0) {
			return err(createNoteServiceError.invalidNoteData('Filename cannot be empty', 'filename'));
		}

		const trimmed = filename.trim();
		
		// Check for invalid characters
		const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
		if (invalidChars.test(trimmed)) {
			return err(createNoteServiceError.invalidNoteData('Filename contains invalid characters', 'filename'));
		}

		// Ensure .md extension
		const normalizedFilename = trimmed.endsWith(NOTES_EXTENSION) 
			? trimmed 
			: `${trimmed}${NOTES_EXTENSION}`;

		return ok(normalizedFilename);
	}

	/**
	 * Generate a unique ID for a note
	 */
	function generateNoteId(): string {
		return nanoid();
	}

	/**
	 * Get the metadata file path for a note
	 */
	function getMetadataPath(filename: string): string {
		const baseName = filename.replace(NOTES_EXTENSION, '');
		return `${baseName}${METADATA_EXTENSION}`;
	}

	/**
	 * Save note metadata
	 */
	function saveMetadata(noteData: NoteFileData): ResultAsync<void, NoteServiceError> {
		const metadataPath = getMetadataPath(noteData.filename);
		const metadataContent = JSON.stringify(noteData, null, 2);
		
		return fileSystem.writeFile(metadataPath, metadataContent)
			.mapErr((error) => error as NoteServiceError);
	}

	/**
	 * Load note metadata
	 */
	function loadMetadata(filename: string): ResultAsync<NoteFileData, NoteServiceError> {
		const metadataPath = getMetadataPath(filename);
		
		return fileSystem.readFile(metadataPath)
			.andThen((content) => {
				return fromPromise(
					Promise.resolve(JSON.parse(content) as NoteFileData),
					(error) => createNoteServiceError.invalidNoteData(`Failed to parse metadata: ${error}`)
				);
			})
			.mapErr((error) => error as NoteServiceError);
	}

	/**
	 * Convert NoteFileData to Note
	 */
	function toNote(noteData: NoteFileData): Note {
		return {
			id: noteData.id,
			filename: noteData.filename,
			content: noteData.content,
			lastModified: new Date(noteData.lastModified),
			size: noteData.size,
			metadata: noteData.metadata
		};
	}

	/**
	 * Create a new note
	 */
	function create(data: CreateNoteData): ResultAsync<Note, NoteServiceError> {
		return validateFilename(data.filename)
			.andThen((filename) => {
				// Check if note already exists
				return fileSystem.exists(filename)
					.andThen((exists) => {
						if (exists) {
							return err(createNoteServiceError.noteAlreadyExists(filename));
						}
						return ok(filename);
					});
			})
			.andThen((filename) => {
				const noteId = generateNoteId();
				const now = new Date();
				const content = data.content || '';
				
				const noteData: NoteFileData = {
					id: noteId,
					filename,
					content,
					lastModified: now.toISOString(),
					size: content.length,
					metadata: data.metadata
				};

				// Save both content and metadata
				return fileSystem.writeFile(filename, content)
					.andThen(() => saveMetadata(noteData))
					.map(() => toNote(noteData));
			})
			.mapErr((error) => error as NoteServiceError);
	}

	/**
	 * Get a note by ID
	 */
	function get(id: string): ResultAsync<Note, NoteServiceError> {
		return list()
			.andThen((notes) => {
				const note = notes.find(n => n.id === id);
				if (!note) {
					return err(createNoteServiceError.noteNotFound(id));
				}
				return ok(note);
			});
	}

	/**
	 * Get a note by filename
	 */
	function getByFilename(filename: string): ResultAsync<Note, NoteServiceError> {
		return validateFilename(filename)
			.andThen((validFilename) => {
				return fileSystem.exists(validFilename)
					.andThen((exists) => {
						if (!exists) {
							return err(createNoteServiceError.noteNotFound(validFilename));
						}
						return ok(validFilename);
					});
			})
			.andThen((validFilename) => {
				return ResultAsync.combine([
					fileSystem.readFile(validFilename),
					loadMetadata(validFilename)
				])
					.andThen(([content, metadata]) => {
						// Update content in metadata if different
						const updatedMetadata = { ...metadata, content };
						return ok(toNote(updatedMetadata));
					});
			})
			.mapErr((error) => error as NoteServiceError);
	}

	/**
	 * Update an existing note
	 */
	function update(id: string, data: UpdateNoteData): ResultAsync<Note, NoteServiceError> {
		return get(id)
			.andThen((existingNote) => {
				const newFilename = data.filename ? data.filename : existingNote.filename;
				
				return validateFilename(newFilename)
					.andThen((validFilename) => {
						// If filename changed, check if new filename already exists
						if (validFilename !== existingNote.filename) {
							return fileSystem.exists(validFilename)
								.andThen((exists) => {
									if (exists) {
										return err(createNoteServiceError.noteAlreadyExists(validFilename));
									}
									return ok(validFilename);
								});
						}
						return ok(validFilename);
					})
					.andThen((validFilename) => {
						const now = new Date();
						const newContent = data.content !== undefined ? data.content : existingNote.content;
						
						const updatedNoteData: NoteFileData = {
							id: existingNote.id,
							filename: validFilename,
							content: newContent,
							lastModified: now.toISOString(),
							size: newContent.length,
							metadata: { ...existingNote.metadata, ...data.metadata }
						};

						// Handle filename change
						const operations: ResultAsync<void, NoteServiceError>[] = [];

						// Write new content
						operations.push(
							fileSystem.writeFile(validFilename, newContent)
								.mapErr((error) => error as NoteServiceError)
						);

						// Save metadata
						operations.push(saveMetadata(updatedNoteData));

						// If filename changed, delete old files
						if (validFilename !== existingNote.filename) {
							operations.push(
								fileSystem.deleteFile(existingNote.filename)
									.mapErr((error) => error as NoteServiceError)
							);
							operations.push(
								fileSystem.deleteFile(getMetadataPath(existingNote.filename))
									.mapErr((error) => error as NoteServiceError)
							);
						}

						return ResultAsync.combine(operations)
							.map(() => toNote(updatedNoteData));
					});
			})
			.mapErr((error) => error as NoteServiceError);
	}

	/**
	 * Delete a note
	 */
	function deleteNote(id: string): ResultAsync<void, NoteServiceError> {
		return get(id)
			.andThen((note) => {
				return ResultAsync.combine([
					fileSystem.deleteFile(note.filename),
					fileSystem.deleteFile(getMetadataPath(note.filename))
				])
					.map(() => undefined);
			})
			.mapErr((error) => error as NoteServiceError);
	}

	/**
	 * List all notes
	 */
	function list(): ResultAsync<Note[], NoteServiceError> {
		return fileSystem.listFiles()
			.andThen((files) => {
				// Filter for .md files
				const noteFiles = files.filter(file => file.filename.endsWith(NOTES_EXTENSION));
				
				// Load each note with its metadata
				const notePromises = noteFiles.map((file) => {
					return ResultAsync.combine([
						fileSystem.readFile(file.filename),
						loadMetadata(file.filename).orElse(() => {
							// If metadata doesn't exist, create it from file info
							const noteData: NoteFileData = {
								id: generateNoteId(),
								filename: file.filename,
								content: '',
								lastModified: file.lastModified.toISOString(),
								size: file.size
							};
							return ok(noteData);
						})
					])
						.andThen(([content, metadata]) => {
							const updatedMetadata = { ...metadata, content, size: content.length };
							return ok(toNote(updatedMetadata));
						});
				});

				return ResultAsync.combine(notePromises);
			})
			.mapErr((error) => error as NoteServiceError);
	}

	/**
	 * Check if a note exists by ID
	 */
	function exists(id: string): ResultAsync<boolean, NoteServiceError> {
		return get(id)
			.map(() => true)
			.orElse((error) => {
				if (error.type === 'NOTE_NOT_FOUND') {
					return ok(false);
				}
				return err(error);
			});
	}

	/**
	 * Check if a note exists by filename
	 */
	function existsByFilename(filename: string): ResultAsync<boolean, NoteServiceError> {
		return validateFilename(filename)
			.andThen((validFilename) => {
				return fileSystem.exists(validFilename);
			})
			.mapErr((error) => error as NoteServiceError);
	}

	/**
	 * Search notes by content or metadata
	 */
	function search(query: string): ResultAsync<Note[], NoteServiceError> {
		return list()
			.map((notes) => {
				const lowerQuery = query.toLowerCase();
				return notes.filter((note) => {
					// Search in content
					if (note.content.toLowerCase().includes(lowerQuery)) {
						return true;
					}
					
					// Search in filename
					if (note.filename.toLowerCase().includes(lowerQuery)) {
						return true;
					}
					
					// Search in metadata
					if (note.metadata) {
						const metadataString = JSON.stringify(note.metadata).toLowerCase();
						if (metadataString.includes(lowerQuery)) {
							return true;
						}
					}
					
					return false;
				});
			});
	}

	// Return the service interface
	return {
		create,
		get,
		getByFilename,
		update,
		delete: deleteNote,
		list,
		exists,
		existsByFilename,
		search
	};
}