import type { CachedNote } from '$lib/services/tinybase';
import matter from 'gray-matter';
import { err, fromThrowable, ok, Result } from 'neverthrow';

export interface ParsedNote {
	filename: string;
	metadata: CachedNote;
	tags: string[];
}

type ParseMarkdownError = {
	type: 'PARSE_MARKDOWN_ERROR';
	error: unknown;
	context: { content: string };
};

const safeMatterParse = (
	content: string
): Result<matter.GrayMatterFile<string>, ParseMarkdownError> => {
	return fromThrowable(
		() => matter(content),
		(error) => ({ type: 'PARSE_MARKDOWN_ERROR', error, context: { content } }) as const
	)();
};

export const parseNoteFrontmatter = (
	filename: string,
	content: string,
	lastModified: Date
): Result<ParsedNote, ParseMarkdownError> => {
	return safeMatterParse(content).map(({ data: frontmatter }) => ({
		filename,
		metadata: {
			favorite: frontmatter.favorite || false,
			title: frontmatter.title || filename.replace('.md', ''),
			modified: lastModified.getTime(),
			created: frontmatter.created || lastModified.getTime()
		},
		tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : []
	}));
};
