import { fromPromise } from 'xstate';
import { ResultAsync, ok, err } from 'neverthrow';
import { FileSystemContext } from '$lib/services/utils/context';

interface WorkspaceInfo {
	id: string;
	name: string;
	path: string;
	lastAccessed: Date;
}

interface SelectWorkspaceInput {
	fileSystemContext: FileSystemContext;
	currentWorkspace: WorkspaceInfo | null;
}

type SelectWorkspaceError = {
	type: 'WORKSPACE_SELECTION_ERROR';
	error: unknown;
};

type SelectWorkspaceResult = ResultAsync<WorkspaceInfo, SelectWorkspaceError>;

export const selectWorkspaceActor = fromPromise(
	async ({ input }: { input: SelectWorkspaceInput }): Promise<SelectWorkspaceResult> => {
		const { fileSystemContext, currentWorkspace } = input;
		console.log('selectWorkspaceActor called with context:', fileSystemContext);

		try {
			switch (fileSystemContext) {
				case FileSystemContext.TAURI:
					console.log('Calling selectWorkspaceInTauri...');
					return await selectWorkspaceInTauri(currentWorkspace);
				
				case FileSystemContext.BROWSER_FS:
					console.log('Calling selectWorkspaceInBrowser...');
					return await selectWorkspaceInBrowser(currentWorkspace);
				
				case FileSystemContext.OPFS:
					console.log('Calling selectWorkspaceInOPFS...');
					return await selectWorkspaceInOPFS(currentWorkspace);
				
				default:
					console.error('Unsupported file system context:', fileSystemContext);
					return err({ type: 'WORKSPACE_SELECTION_ERROR', error: 'Unsupported file system context' });
			}
		} catch (error) {
			console.error('Error in selectWorkspaceActor:', error);
			return err({ type: 'WORKSPACE_SELECTION_ERROR', error });
		}
	}
);

async function selectWorkspaceInTauri(currentWorkspace: WorkspaceInfo | null): Promise<SelectWorkspaceResult> {
	try {
		console.log('Attempting to import Tauri dialog plugin...');
		const { open } = await import('@tauri-apps/plugin-dialog');
		console.log('Tauri dialog plugin imported successfully');
		
		console.log('Opening directory picker...');
		const selected = await open({
			directory: true,
			multiple: false,
			title: 'Select Workspace Directory',
			defaultPath: undefined
		});
		console.log('Directory picker result:', selected);

		if (!selected) {
			// User cancelled
			console.log('No directory selected or user cancelled');
			if (currentWorkspace) {
				return ok(currentWorkspace);
			}
			return err({ type: 'WORKSPACE_SELECTION_ERROR', error: 'No workspace selected' });
		}

		// In Tauri v2, open() returns a string path, not an array
		const selectedPath = typeof selected === 'string' ? selected : selected.toString();

		const workspaceInfo: WorkspaceInfo = {
			id: generateWorkspaceId(selectedPath),
			name: extractWorkspaceName(selectedPath),
			path: selectedPath,
			lastAccessed: new Date()
		};

		// Store workspace info in local storage for persistence
		await storeWorkspaceInfo(workspaceInfo);

		return ok(workspaceInfo);
	} catch (error) {
		console.error('Error in selectWorkspaceInTauri:', error);
		return err({ type: 'WORKSPACE_SELECTION_ERROR', error });
	}
}

async function selectWorkspaceInBrowser(currentWorkspace: WorkspaceInfo | null): Promise<SelectWorkspaceResult> {
	try {
		// File System Access API
		const directoryHandle = await (window as any).showDirectoryPicker({
			mode: 'readwrite'
		});

		const workspaceInfo: WorkspaceInfo = {
			id: generateWorkspaceId(directoryHandle.name),
			name: directoryHandle.name,
			path: directoryHandle.name, // In browser, we use the handle name as path
			lastAccessed: new Date()
		};

		// Store directory handle for later use
		await storeDirectoryHandle(workspaceInfo.id, directoryHandle);
		await storeWorkspaceInfo(workspaceInfo);

		return ok(workspaceInfo);
	} catch (error) {
		if (error.name === 'AbortError') {
			// User cancelled
			if (currentWorkspace) {
				return ok(currentWorkspace);
			}
		}
		return err({ type: 'WORKSPACE_SELECTION_ERROR', error });
	}
}

async function selectWorkspaceInOPFS(currentWorkspace: WorkspaceInfo | null): Promise<SelectWorkspaceResult> {
	try {
		// For OPFS, we automatically create and use a default workspace
		// First, check if we have existing workspaces
		const existingWorkspaces = await getExistingOPFSWorkspaces();
		
		// Always prefer the default workspace if it exists
		const defaultWorkspace = existingWorkspaces.find(w => w.id === 'default');
		if (defaultWorkspace) {
			// Update last accessed time
			defaultWorkspace.lastAccessed = new Date();
			await storeWorkspaceInfo(defaultWorkspace);
			return ok(defaultWorkspace);
		}

		// If no default workspace exists, create it
		const newDefaultWorkspace: WorkspaceInfo = {
			id: 'default',
			name: 'My Workspace',
			path: 'workspaces/default',
			lastAccessed: new Date()
		};

		await ensureOPFSWorkspaceDirectory(newDefaultWorkspace.path);
		await storeWorkspaceInfo(newDefaultWorkspace);

		return ok(newDefaultWorkspace);
	} catch (error) {
		console.error('Error in selectWorkspaceInOPFS:', error);
		return err({ type: 'WORKSPACE_SELECTION_ERROR', error });
	}
}

async function getExistingOPFSWorkspaces(): Promise<WorkspaceInfo[]> {
	try {
		const stored = localStorage.getItem('md-uy-workspaces');
		if (!stored) return [];
		
		const workspaces = JSON.parse(stored) as WorkspaceInfo[];
		return workspaces.map(w => ({
			...w,
			lastAccessed: new Date(w.lastAccessed)
		}));
	} catch {
		return [];
	}
}

async function ensureOPFSWorkspaceDirectory(path: string): Promise<void> {
	const rootDir = await navigator.storage.getDirectory();
	const pathParts = path.split('/').filter(Boolean);
	
	let currentDir = rootDir;
	for (const part of pathParts) {
		currentDir = await currentDir.getDirectoryHandle(part, { create: true });
	}
}

async function storeWorkspaceInfo(workspace: WorkspaceInfo): Promise<void> {
	try {
		const existing = await getExistingOPFSWorkspaces();
		const updated = existing.filter(w => w.id !== workspace.id);
		updated.push(workspace);
		
		localStorage.setItem('md-uy-workspaces', JSON.stringify(updated));
	} catch (error) {
		console.warn('Failed to store workspace info:', error);
	}
}

async function storeDirectoryHandle(workspaceId: string, handle: FileSystemDirectoryHandle): Promise<void> {
	try {
		// Store directory handle in IndexedDB for persistence across sessions
		const request = indexedDB.open('md-uy-workspace-handles', 1);
		
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains('handles')) {
				db.createObjectStore('handles');
			}
		};

		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				const db = request.result;
				const transaction = db.transaction(['handles'], 'readwrite');
				const store = transaction.objectStore('handles');
				store.put(handle, workspaceId);
				
				transaction.oncomplete = () => resolve();
				transaction.onerror = () => reject(transaction.error);
			};
			
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		console.warn('Failed to store directory handle:', error);
	}
}

function generateWorkspaceId(path: string): string {
	// Generate a stable ID based on the path
	return btoa(path).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

function extractWorkspaceName(path: string): string {
	// Extract the last part of the path as the workspace name
	const parts = path.split(/[/\\]/);
	return parts[parts.length - 1] || 'Workspace';
}