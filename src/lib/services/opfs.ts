export async function getNoteFromOPFS(filename: string): Promise<string> {
	try {
		const rootDir = await navigator.storage.getDirectory();
		const fileHandle = await rootDir.getFileHandle(filename, { create: true });
		const file = await fileHandle.getFile();
		console.log('e', await file.text());
		return await file.text();
	} catch (error) {
		console.warn('Could not read note from OPFS:', error);
		return ''; // Return empty string for new notes
	}
}

export async function saveNoteToOPFS(noteDisplayName: string, content: string): Promise<void> {
	try {
		const rootDir = await navigator.storage.getDirectory();
		const fileHandle = await rootDir.getFileHandle(noteDisplayName, { create: true });
		const writable = await fileHandle.createWritable();
		await writable.write(content);
		await writable.close();
	} catch (error) {
		console.error('Failed to save note to OPFS:', error);
	}
}

export interface NoteInfo {
	filename: string;
	name: string;
	lastModified: Date;
	size: number;
}

export async function listNotesFromOPFS(): Promise<NoteInfo[]> {
	try {
		const rootDir = await navigator.storage.getDirectory();
		const notes: NoteInfo[] = [];

		// Iterate through all files in the root directory
		for await (const [name, handle] of rootDir.entries()) {
			// Only include .md files
			if (handle.kind === 'file' && name.endsWith('.md')) {
				const file = await handle.getFile();
				const noteId = name.replace('.md', ''); // Remove .md extension

				notes.push({
					filename: noteId,
					name: name,
					lastModified: new Date(file.lastModified),
					size: file.size
				});
			}
		}

		// Sort by last modified date (newest first)
		notes.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

		return notes;
	} catch (error) {
		console.error('Failed to list notes from OPFS:', error);
		return [];
	}
}

export async function renameNoteInOPFS(oldFilename: string, newFilename: string): Promise<void> {
	try {
		const rootDir = await navigator.storage.getDirectory();

		// Read old file content
		const oldHandle = await rootDir.getFileHandle(oldFilename);
		const file = await oldHandle.getFile();
		const content = await file.text();

		// Create new file
		const newHandle = await rootDir.getFileHandle(newFilename, { create: true });
		const writable = await newHandle.createWritable();
		await writable.write(content);
		await writable.close();

		// Delete old file
		await rootDir.removeEntry(oldFilename);
	} catch (error) {
		console.error('Failed to rename note:', error);
		throw error;
	}
}
