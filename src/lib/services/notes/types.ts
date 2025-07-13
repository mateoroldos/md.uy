import { ResultAsync } from 'neverthrow';
import type { FileSystemError } from '../filesystem';

/**
 * Note data structure
 */
export interface Note {
	id: string;
	filename: string;
	content: string;
	lastModified: Date;
	size: number;
	metadata?: Record<string, unknown>;
}

/**
 * Note creation data
 */
export interface CreateNoteData {
	filename: string;
	content: string;
	metadata?: Record<string, unknown>;
}

/**
 * Note update data
 */
export interface UpdateNoteData {
	content?: string;
	filename?: string;
	metadata?: Record<string, unknown>;
}

/**
 * Note service error types
 */
export type NoteServiceError =
	| FileSystemError
	| NoteNotFoundError
	| InvalidNoteDataError
	| NoteAlreadyExistsError;

export interface NoteNotFoundError {
	type: 'NOTE_NOT_FOUND';
	message: string;
	noteId: string;
}

export interface InvalidNoteDataError {
	type: 'INVALID_NOTE_DATA';
	message: string;
	field?: string;
}

export interface NoteAlreadyExistsError {
	type: 'NOTE_ALREADY_EXISTS';
	message: string;
	filename: string;
}

/**
 * Note service interface
 */
export interface NoteService {
	/**
	 * Create a new note
	 */
	create(data: CreateNoteData): ResultAsync<Note, NoteServiceError>;

	/**
	 * Get a note by ID
	 */
	get(id: string): ResultAsync<Note, NoteServiceError>;

	/**
	 * Get a note by filename
	 */
	getByFilename(filename: string): ResultAsync<Note, NoteServiceError>;

	/**
	 * Update an existing note
	 */
	update(id: string, data: UpdateNoteData): ResultAsync<Note, NoteServiceError>;

	/**
	 * Delete a note
	 */
	delete(id: string): ResultAsync<void, NoteServiceError>;

	/**
	 * List all notes
	 */
	list(): ResultAsync<Note[], NoteServiceError>;

	/**
	 * Check if a note exists
	 */
	exists(id: string): ResultAsync<boolean, NoteServiceError>;

	/**
	 * Check if a note exists by filename
	 */
	existsByFilename(filename: string): ResultAsync<boolean, NoteServiceError>;

	/**
	 * Search notes by content or metadata
	 */
	search?(query: string): ResultAsync<Note[], NoteServiceError>;
}

/**
 * Helper functions for creating note service errors
 */
export const createNoteServiceError = {
	noteNotFound: (noteId: string, message?: string): NoteNotFoundError => ({
		type: 'NOTE_NOT_FOUND',
		message: message || `Note not found: ${noteId}`,
		noteId
	}),

	invalidNoteData: (message: string, field?: string): InvalidNoteDataError => ({
		type: 'INVALID_NOTE_DATA',
		message,
		field
	}),

	noteAlreadyExists: (filename: string, message?: string): NoteAlreadyExistsError => ({
		type: 'NOTE_ALREADY_EXISTS',
		message: message || `Note already exists: ${filename}`,
		filename
	})
};