import { parse } from "marked";
import DOMPurify from "isomorphic-dompurify";

export const renderMarkdown = async (content: string): Promise<string> => {
	try {
		return await parse(content);
	} catch (error) {
		console.error('Markdown parsing error:', error);
		return `<p>${escapeHtml(content)}</p>`;
	}
};

export const escapeHtml = (text: string): string => {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
};

export const sanitizeHtml = (html: string): string => {
	return DOMPurify.sanitize(html);
};

export const formatCode = (code: string, language?: string): string => {
	const lang = language || 'text';
	return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
};

export const formatTimestamp = (timestamp: number): string => {
	const date = new Date(timestamp);
	return date.toLocaleTimeString();
}; 