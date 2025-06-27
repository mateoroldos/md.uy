export interface User {
	name: string;
	color: string;
}

export type EditorMode = 'edit' | 'preview' | 'presentation';

export type Platform = 'web' | 'desktop';

export type NoteFile = {
	filename: string;
	lastModified: Date;
	size: string;
};
