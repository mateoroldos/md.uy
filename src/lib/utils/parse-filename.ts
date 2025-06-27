export const parseFilename = (filename: string): { name: string; extension: string } => {
	const lastDotIndex = filename.lastIndexOf('.');
	return lastDotIndex > 0
		? { name: filename.substring(0, lastDotIndex), extension: filename.substring(lastDotIndex) }
		: { name: filename, extension: '' };
};
