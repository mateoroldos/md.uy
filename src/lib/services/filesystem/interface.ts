import { ResultAsync } from 'neverthrow';

export interface FileMetadata {
	filename: string;
	lastModified: Date;
	size: number;
}

export type FileSystemError =
	| FileNotFoundError
	| FileAlreadyExistsError
	| PermissionDeniedError
	| QuotaExceededError
	| InvalidPathError
	| NetworkError
	| UnknownFileSystemError;

export interface FileNotFoundError {
	type: 'FILE_NOT_FOUND';
	message: string;
	path: string;
}

export interface FileAlreadyExistsError {
	type: 'FILE_ALREADY_EXISTS';
	message: string;
	path: string;
}

export interface PermissionDeniedError {
	type: 'PERMISSION_DENIED';
	message: string;
	path: string;
}

export interface QuotaExceededError {
	type: 'QUOTA_EXCEEDED';
	message: string;
	path: string;
}

export interface InvalidPathError {
	type: 'INVALID_PATH';
	message: string;
	path: string;
}

export interface NetworkError {
	type: 'NETWORK_ERROR';
	message: string;
	path?: string;
}

export interface UnknownFileSystemError {
	type: 'UNKNOWN_ERROR';
	message: string;
	path?: string;
	originalError: unknown;
}

export interface FileSystem {
	writeFile(path: string, content: string): ResultAsync<void, FileSystemError>;
	readFile(path: string): ResultAsync<string, FileSystemError>;
	exists(path: string): ResultAsync<boolean, FileSystemError>;
	deleteFile(path: string): ResultAsync<void, FileSystemError>;
	listFiles(path?: string): ResultAsync<FileMetadata[], FileSystemError>;
	createDirectory?(path: string): ResultAsync<void, FileSystemError>;
	getMetadata?(path: string): ResultAsync<FileMetadata, FileSystemError>;
}

