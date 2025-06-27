export const ensureMarkdownExtension = (filename: string): string =>
	filename.endsWith('.md') ? filename : `${filename}.md`;
