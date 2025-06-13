import { marked } from 'marked';
import * as Y from 'yjs';

export const markdownToHtml = (node: HTMLElement, { ytext }: { ytext: Y.Text }) => {
	node.innerHTML = mdToHtml(ytext.toString());

	ytext.observe(() => {
		node.innerHTML = mdToHtml(ytext.toString());
	});
};

const mdToHtml = (content: string) => {
	return marked
		.use({
			gfm: true,
			breaks: true
		})
		.parse(content) as string;
};
