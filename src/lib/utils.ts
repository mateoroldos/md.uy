import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { customAlphabet } from 'nanoid';
import { NANOID_ALPHABET, NANOID_LENGTH } from './constants';
import * as Y from 'yjs';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const generateId = () => {
	return customAlphabet(NANOID_ALPHABET, NANOID_LENGTH)();
};

export const isValidId = (id: string) => {
	return new RegExp(`^([${NANOID_ALPHABET}]{10}|[${NANOID_ALPHABET}]{${NANOID_LENGTH}})$`).test(id);
};
