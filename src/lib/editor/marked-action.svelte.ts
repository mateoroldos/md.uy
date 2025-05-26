import { marked } from 'marked';
import * as Y from 'yjs';

export const markedAction = (node: HTMLElement, { ytext }: { ytext: Y.Text }) => {
	node.innerHTML = generateHTML(ytext.toString());

	ytext.observe(() => {
		node.innerHTML = generateHTML(ytext.toString());
	});
};

const generateHTML = (content: string) => {
	return marked
		.use({
			gfm: true,
			breaks: true
		})
		.parse(content) as string;
};
