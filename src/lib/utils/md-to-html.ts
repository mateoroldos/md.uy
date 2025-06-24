import { marked } from 'marked';
import { fromThrowable } from 'neverthrow';

export const safeMarkdownToHtml = (content: string) => {
	return fromThrowable(
		() =>
			marked
				.use({
					gfm: true,
					breaks: true
				})
				.parse(content) as string,
		(error) =>
			({
				type: 'MARKDOWN_PARSE_ERROR',
				error,
				context: {
					content
				}
			}) as const
	)();
};
