export interface Shortcut {
	code: string;
	alt?: boolean;
	shift?: boolean;
	control?: boolean;
}

type Actions = 'EDIT_MODE' | 'PREVIEW_MODE' | 'COPY_URL' | 'COPY_CONTENT' | 'DOWNLOAD_CONTENT';

export const KEYMAP: Record<Actions, Shortcut> = {
	EDIT_MODE: {
		code: 'KeyE',
		alt: false,
		shift: false,
		control: true
	},
	PREVIEW_MODE: {
		code: 'KeyP',
		alt: false,
		shift: false,
		control: true
	},
	COPY_URL: {
		code: 'KeyD',
		alt: false,
		shift: false,
		control: true
	},
	COPY_CONTENT: {
		code: 'KeyK',
		alt: false,
		shift: false,
		control: true
	},
	DOWNLOAD_CONTENT: {
		code: 'KeyS',
		alt: false,
		shift: false,
		control: true
	}
};
