import { fromPromise, ResultAsync } from 'neverthrow';
import type { FileSystem, FileSystemError, FileMetadata } from '../interface';

// Tauri v2 API types (these would normally come from @tauri-apps/api)
declare global {
	interface Window {
		__TAURI__: {
			fs: {
				writeTextFile: (path: string, content: string) => Promise<void>;
				readTextFile: (path: string) => Promise<string>;
				exists: (path: string) => Promise<boolean>;
				remove: (path: string) => Promise<void>;
				readDir: (
					path: string
				) => Promise<Array<{ name: string; isFile: boolean; isDirectory: boolean }>>;
				createDir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
				metadata: (path: string) => Promise<{
					isFile: boolean;
					isDirectory: boolean;
					size: number;
					modifiedAt: number;
				}>;
			};
			path: {
				join: (...paths: string[]) => Promise<string>;
				dirname: (path: string) => Promise<string>;
				basename: (path: string) => Promise<string>;
			};
		};
	}
}

export class TauriFileSystem implements FileSystem {
	private basePath: string;

	constructor(basePath = '') {
		this.basePath = basePath;
	}

	private async getFullPath(path: string): Promise<string> {
		if (!window.__TAURI__) {
			throw new Error('Tauri is not available');
		}

		if (this.basePath) {
			return window.__TAURI__.path.join(this.basePath, path);
		}
		return path;
	}

	private async ensureDirectory(filePath: string): Promise<void> {
		const dirPath = await window.__TAURI__.path.dirname(filePath);

		try {
			const exists = await window.__TAURI__.fs.exists(dirPath);
			if (!exists) {
				await window.__TAURI__.fs.createDir(dirPath, { recursive: true });
			}
		} catch (error) {
			// Directory might already exist, ignore error
		}
	}

	writeFile(path: string, content: string): ResultAsync<void, FileSystemError> {
		return fromPromise(
			(async () => {
				const fullPath = await this.getFullPath(path);
				await this.ensureDirectory(fullPath);
				await window.__TAURI__.fs.writeTextFile(fullPath, content);
			})(),
			(error) => this.mapError(error, path)
		);
	}

	readFile(path: string): ResultAsync<string, FileSystemError> {
		return fromPromise(
			(async () => {
				const fullPath = await this.getFullPath(path);
				return window.__TAURI__.fs.readTextFile(fullPath);
			})(),
			(error) => this.mapError(error, path)
		);
	}

	exists(path: string): ResultAsync<boolean, FileSystemError> {
		return fromPromise(
			(async () => {
				const fullPath = await this.getFullPath(path);
				return window.__TAURI__.fs.exists(fullPath);
			})(),
			(error) => this.mapError(error, path)
		);
	}

	deleteFile(path: string): ResultAsync<void, FileSystemError> {
		return fromPromise(
			(async () => {
				const fullPath = await this.getFullPath(path);
				await window.__TAURI__.fs.remove(fullPath);
			})(),
			(error) => this.mapError(error, path)
		);
	}

	listFiles(path = ''): ResultAsync<FileMetadata[], FileSystemError> {
		return fromPromise(
			(async () => {
				const fullPath = await this.getFullPath(path);
				const entries = await window.__TAURI__.fs.readDir(fullPath);
				const files: FileMetadata[] = [];

				for (const entry of entries) {
					if (entry.isFile) {
						const entryPath = await window.__TAURI__.path.join(fullPath, entry.name);
						const metadata = await window.__TAURI__.fs.metadata(entryPath);

						files.push({
							filename: entry.name,
							lastModified: new Date(metadata.modifiedAt),
							size: metadata.size
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
				const fullPath = await this.getFullPath(path);
				await window.__TAURI__.fs.createDir(fullPath, { recursive: true });
			})(),
			(error) => this.mapError(error, path)
		);
	}

	getMetadata(path: string): ResultAsync<FileMetadata, FileSystemError> {
		return fromPromise(
			(async () => {
				const fullPath = await this.getFullPath(path);
				const metadata = await window.__TAURI__.fs.metadata(fullPath);
				const filename = await window.__TAURI__.path.basename(fullPath);

				return {
					filename,
					lastModified: new Date(metadata.modifiedAt),
					size: metadata.size
				};
			})(),
			(error) => this.mapError(error, path)
		);
	}

	private mapError(error: unknown, path?: string): FileSystemError {
		if (typeof error === 'string') {
			// Tauri errors are often strings
			if (error.includes('No such file or directory') || error.includes('not found')) {
				return {
					type: 'FILE_NOT_FOUND',
					message: error,
					path: path || ''
				};
			}
			if (error.includes('Permission denied') || error.includes('Access denied')) {
				return {
					type: 'PERMISSION_DENIED',
					message: error,
					path: path || ''
				};
			}
			if (error.includes('File exists') || error.includes('already exists')) {
				return {
					type: 'FILE_ALREADY_EXISTS',
					message: error,
					path: path || ''
				};
			}
			if (error.includes('No space left') || error.includes('quota')) {
				return {
					type: 'QUOTA_EXCEEDED',
					message: error,
					path: path || ''
				};
			}
			if (error.includes('Invalid') || error.includes('illegal')) {
				return {
					type: 'INVALID_PATH',
					message: error,
					path: path || ''
				};
			}
		}

		if (error instanceof Error) {
			return {
				type: 'UNKNOWN_ERROR',
				message: error.message,
				path: path,
				originalError: error
			};
		}

		return {
			type: 'UNKNOWN_ERROR',
			message: typeof error === 'string' ? error : 'Unknown error occurred',
			path: path,
			originalError: error
		};
	}
}
