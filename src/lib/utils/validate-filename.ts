import { err, ok, type Result } from 'neverthrow';

type ValidateFilenameError = { type: 'INVALID_FILENAME'; message: string };

export const validateFilename = (filename: string): Result<string, ValidateFilenameError> => {
	const trimmed = filename.trim();
	if (trimmed.length === 0) {
		return err({ type: 'INVALID_FILENAME', message: 'Filename cannot be empty' });
	}
	if (trimmed.includes('/') || trimmed.includes('\\')) {
		return err({ type: 'INVALID_FILENAME', message: 'Filename cannot contain path separators' });
	}
	return ok(trimmed);
};
