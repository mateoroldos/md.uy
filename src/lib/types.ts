export interface User {
	name: string;
	color: string;
}

export type EditorMode = 'edit' | 'preview' | 'presentation';

export type Platform = 'web' | 'desktop';

export type Note = {
	filename: string;
	lastModified: Date;
	size: string;
};

export interface NoteMetadata {
	favorite: boolean;
	title: string;
	modified: number;
	tags?: string[];
	created?: number;
}
