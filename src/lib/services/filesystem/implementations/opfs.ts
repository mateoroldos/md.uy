import { fromPromise, ResultAsync } from 'neverthrow';
import type { FileSystem, FileSystemError, FileMetadata } from '../interface';

export class OPFSFileSystem implements FileSystem {
	private workspacePath: string;

	constructor(workspacePath: string = '') {
		this.workspacePath = workspacePath;
	}

	private async getDirectory(): Promise<FileSystemDirectoryHandle> {
		if (!navigator.storage?.getDirectory) {
			throw new Error('OPFS is not supported in this environment');
		}

		const rootDir = await navigator.storage.getDirectory();

		if (!this.workspacePath) {
			return rootDir;
		}

		const pathParts = this.workspacePath.split('/').filter(Boolean);
		let currentDir = rootDir;

		for (const part of pathParts) {
			currentDir = await currentDir.getDirectoryHandle(part, { create: true });
		}

		return currentDir;
	}

	private async ensureDirectoryPath(path: string): Promise<FileSystemDirectoryHandle> {
		const workspaceDir = await this.getDirectory();
		const pathParts = path.split('/').filter(Boolean);

		if (pathParts.length === 0) {
			return workspaceDir;
		}

		// Remove the filename from the path
		const dirParts = pathParts.slice(0, -1);
		let currentDir = workspaceDir;

		for (const part of dirParts) {
			currentDir = await currentDir.getDirectoryHandle(part, { create: true });
		}

		return currentDir;
	}

	private getFilename(path: string): string {
		const parts = path.split('/').filter(Boolean);
		return parts[parts.length - 1] || path;
	}

	writeFile(path: string, content: string): ResultAsync<void, FileSystemError> {
		return fromPromise(
			(async () => {
				const dir = await this.ensureDirectoryPath(path);
				const filename = this.getFilename(path);
				const fileHandle = await dir.getFileHandle(filename, { create: true });
				const writable = await fileHandle.createWritable();
				await writable.write(content);
				await writable.close();
			})(),
			(error) => this.mapError(error, path)
		);
	}

	readFile(path: string): ResultAsync<string, FileSystemError> {
		return fromPromise(
			(async () => {
				const dir = await this.ensureDirectoryPath(path);
				const filename = this.getFilename(path);
				const fileHandle = await dir.getFileHandle(filename);
				const file = await fileHandle.getFile();
				return file.text();
			})(),
			(error) => this.mapError(error, path)
		);
	}

	exists(path: string): ResultAsync<boolean, FileSystemError> {
		return fromPromise(
			(async () => {
				try {
					const dir = await this.ensureDirectoryPath(path);
					const filename = this.getFilename(path);
					await dir.getFileHandle(filename);
					return true;
				} catch {
					return false;
				}
			})(),
			(error) => this.mapError(error, path)
		);
	}

	deleteFile(path: string): ResultAsync<void, FileSystemError> {
		return fromPromise(
			(async () => {
				const dir = await this.ensureDirectoryPath(path);
				const filename = this.getFilename(path);
				await dir.removeEntry(filename);
			})(),
			(error) => this.mapError(error, path)
		);
	}

	listFiles(path = ''): ResultAsync<FileMetadata[], FileSystemError> {
		return fromPromise(
			(async () => {
				const dir = path
					? await this.ensureDirectoryPath(path + '/dummy')
					: await this.getDirectory();
				const files: FileMetadata[] = [];

				// @ts-ignore: entries method exists on FileSystemDirectoryHandle
				for await (const [name, handle] of dir.entries()) {
					if (handle.kind === 'file') {
						const file = await handle.getFile();
						files.push({
							filename: name,
							lastModified: new Date(file.lastModified),
							size: file.size
						});
					}
				}

				// Sort by last modified date (newest first)
				files.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
				return files;
			})(),
			(error) => this.mapError(error, path)
		);
	}

	createDirectory(path: string): ResultAsync<void, FileSystemError> {
		return fromPromise(
			(async () => {
				await this.ensureDirectoryPath(path + '/dummy');
			})(),
			(error) => this.mapError(error, path)
		);
	}

	getMetadata(path: string): ResultAsync<FileMetadata, FileSystemError> {
		return fromPromise(
			(async () => {
				const dir = await this.ensureDirectoryPath(path);
				const filename = this.getFilename(path);
				const fileHandle = await dir.getFileHandle(filename);
				const file = await fileHandle.getFile();

				return {
					filename,
					lastModified: new Date(file.lastModified),
					size: file.size
				};
			})(),
			(error) => this.mapError(error, path)
		);
	}

	private mapError(error: unknown, path?: string): FileSystemError {
		if (error instanceof DOMException) {
			switch (error.name) {
				case 'NotFoundError':
					return {
						type: 'FILE_NOT_FOUND',
						message: error.message,
						path: path || ''
					};
				case 'QuotaExceededError':
					return {
						type: 'QUOTA_EXCEEDED',
						message: error.message,
						path: path || ''
					};
				case 'NotAllowedError':
					return {
						type: 'PERMISSION_DENIED',
						message: error.message,
						path: path || ''
					};
				case 'InvalidModificationError':
					return {
						type: 'FILE_ALREADY_EXISTS',
						message: error.message,
						path: path || ''
					};
				case 'TypeMismatchError':
					return {
						type: 'INVALID_PATH',
						message: error.message,
						path: path || ''
					};
				default:
					return {
						type: 'UNKNOWN_ERROR',
						message: error.message,
						path: path,
						originalError: error
					};
			}
		}

		return {
			type: 'UNKNOWN_ERROR',
			message: error instanceof Error ? error.message : 'Unknown error occurred',
			path: path,
			originalError: error
		};
	}
}
