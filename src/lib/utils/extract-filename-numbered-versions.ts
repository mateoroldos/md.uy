export const extractNumberedVersions = (
	filenames: string[],
	baseName: string,
	extension: string
): Set<number> => {
	const escapedBaseName = escapeRegExp(baseName);
	const escapedExtension = escapeRegExp(extension);
	const numberedRegex = new RegExp(`^${escapedBaseName}-(\\d+)${escapedExtension}$`, 'i');

	return filenames.reduce((acc, filename) => {
		const match = filename.match(numberedRegex);
		if (match) {
			acc.add(parseInt(match[1], 10));
		}
		return acc;
	}, new Set<number>());
};

const escapeRegExp = (string: string): string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
