export function filenameToDisplayName(filename: string): string {
	return filename.replace('.md', '');
}

export function displayNameToFilename(displayName: string): string {
	// Only sanitize characters that are actually problematic for file systems
	const sanitized = displayName.replace(/[<>:"/\\|?*]/g, '');
	return sanitized + '.md';
}
