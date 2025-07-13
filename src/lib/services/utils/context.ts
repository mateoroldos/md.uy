export enum FileSystemContext {
	OPFS = 'opfs',
	BROWSER_FS = 'browser-fs',
	TAURI = 'tauri',
	UNKNOWN = 'unknown'
}

export function detectContext(): FileSystemContext {
	if (typeof window !== 'undefined' && '__TAURI__' in window) {
		return FileSystemContext.TAURI;
	}

	if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
		return FileSystemContext.BROWSER_FS;
	}

	if (
		typeof navigator !== 'undefined' &&
		'storage' in navigator &&
		'getDirectory' in navigator.storage
	) {
		return FileSystemContext.OPFS;
	}

	return FileSystemContext.UNKNOWN;
}

export function isContextAvailable(context: FileSystemContext): boolean {
	switch (context) {
		case FileSystemContext.TAURI:
			return typeof window !== 'undefined' && '__TAURI__' in window;

		case FileSystemContext.BROWSER_FS:
			return typeof window !== 'undefined' && 'showDirectoryPicker' in window;

		case FileSystemContext.OPFS:
			return (
				typeof navigator !== 'undefined' &&
				'storage' in navigator &&
				'getDirectory' in navigator.storage
			);

		default:
			return false;
	}
}

// export function getAvailableContexts(): FileSystemContext[] {
// 	const contexts: FileSystemContext[] = [];
//
// 	if (isContextAvailable(FileSystemContext.BROWSER_FS)) {
// 		contexts.push(FileSystemContext.BROWSER_FS);
// 	}
//
// 	if (isContextAvailable(FileSystemContext.TAURI)) {
// 		contexts.push(FileSystemContext.TAURI);
// 	}
//
// 	if (isContextAvailable(FileSystemContext.OPFS)) {
// 		contexts.push(FileSystemContext.OPFS);
// 	}
//
// 	return contexts;
// }

