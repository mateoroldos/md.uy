import { extractNumberedVersions } from './extract-filename-numbered-versions';
import { findNextAvailableNumber } from './find-next-available-number';
import { parseFilename } from './parse-filename';

export const findUniqueFilenameVariant = (
	baseFilename: string,
	existingFilenames: Set<string>
): string => {
	if (!existingFilenames.has(baseFilename.toLowerCase())) {
		return baseFilename;
	}

	const { name, extension } = parseFilename(baseFilename);
	const numberedVersions = extractNumberedVersions(Array.from(existingFilenames), name, extension);

	const nextNumber = findNextAvailableNumber(numberedVersions);
	return `${name}-${nextNumber}${extension}`;
};
