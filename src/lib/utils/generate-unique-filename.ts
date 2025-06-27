import { Result, ok } from 'neverthrow';
import { ensureMarkdownExtension } from './ensure-markdown-extension';
import { validateFilename } from './validate-filename';
import { findUniqueFilenameVariant } from './find-unique-filename-variant';

type GenerateUniqueFilenameError = { type: 'INVALID_FILENAME'; message: string };

export const generateUniqueFilename = (
	filename: string | undefined,
	existingFilenames: Set<string>
): Result<string, GenerateUniqueFilenameError> => {
	// Handle undefined filename
	if (!filename) {
		const baseFilename = 'untitled.md';
		return ok(findUniqueFilenameVariant(baseFilename, existingFilenames));
	}

	// Validate and process custom filename
	return validateFilename(filename)
		.map(ensureMarkdownExtension)
		.map((baseFilename) => findUniqueFilenameVariant(baseFilename, existingFilenames));
};
