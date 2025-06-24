import { getNoteFromOPFS, saveNoteToOPFS } from '$lib/services/opfs';
import type { NoteMetadata, Platform } from '$lib/types';
import matter from 'gray-matter';
import { fromPromise } from 'xstate';

export const updateFrontmatterActor = fromPromise(
	async ({
		input
	}: {
		input: {
			filename: string;
			metadata: Partial<NoteMetadata>;
			platform: Platform;
		};
	}) => {
		const { filename, metadata, platform } = input;

		// Get note content
		const contentResult = await getNoteFromOPFS(filename);
		const content = await contentResult.match(
			(noteContent) => noteContent,
			(error) => {
				console.error('Failed to get note content:', error);
				throw new Error(`Failed to load note: ${error.type}`);
			}
		);

		// Parse and update frontmatter
		const { data: currentFrontmatter, content: markdownContent } = matter(content);

		const updatedFrontmatter = {
			...currentFrontmatter,
			...metadata,
			// Convert tags back from JSON string if present
			...(metadata.tags && { tags: metadata.tags })
		};

		const newContent = matter.stringify(markdownContent, updatedFrontmatter);

		// Save updated content
		const saveResult = await saveNoteToOPFS(filename, newContent);
		await saveResult.match(
			() => ({ filename, updatedFrontmatter }),
			(error) => {
				console.error('Failed to save note:', error);
				throw new Error(`Failed to save note: ${error.type}`);
			}
		);

		return { filename, updatedFrontmatter };
	}
);
