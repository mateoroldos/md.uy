import type { FileSystem } from './interface';
import { OPFSFileSystem } from './implementations/opfs';
import { BrowserFileSystem } from './implementations/browser-fs';
import { TauriFileSystem } from './implementations/tauri';
import { detectContext, FileSystemContext, isContextAvailable } from '../utils/context';

export function createFileSystem(
	context?: FileSystemContext,
	options?: {
		directoryHandle?: FileSystemDirectoryHandle;
		basePath?: string;
		workspacePath?: string;
	}
): FileSystem {
	const targetContext = context || detectContext();

	switch (targetContext) {
		case FileSystemContext.TAURI:
			if (!isContextAvailable(FileSystemContext.TAURI)) {
				throw new Error('Tauri is not available in this environment');
			}
			return new TauriFileSystem(options?.basePath);

		case FileSystemContext.BROWSER_FS:
			if (!isContextAvailable(FileSystemContext.BROWSER_FS)) {
				throw new Error('Browser File System API is not available in this environment');
			}
			return new BrowserFileSystem(options?.directoryHandle);

		case FileSystemContext.OPFS:
			if (!isContextAvailable(FileSystemContext.OPFS)) {
				throw new Error('OPFS is not available in this environment');
			}
			return new OPFSFileSystem(options?.workspacePath);

		default:
			// Fallback to OPFS if available, otherwise throw
			if (isContextAvailable(FileSystemContext.OPFS)) {
				return new OPFSFileSystem(options?.workspacePath);
			}
			throw new Error('No supported file system implementation available');
	}
}

export function createFileSystemWithFallback(options?: {
	directoryHandle?: FileSystemDirectoryHandle;
	basePath?: string;
	workspacePath?: string;
	preferredContexts?: FileSystemContext[];
}): FileSystem {
	const contexts = options?.preferredContexts || [
		FileSystemContext.BROWSER_FS,
		FileSystemContext.TAURI,
		FileSystemContext.OPFS
	];

	for (const context of contexts) {
		if (isContextAvailable(context)) {
			try {
				return createFileSystem(context, options);
			} catch {
				// Continue to next context
				continue;
			}
		}
	}

	throw new Error('No supported file system implementation available');
}

