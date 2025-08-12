import DOMPurify from "isomorphic-dompurify";

export default function sanitizeHtml(htmlContent) {
	const clean = DOMPurify.sanitize(htmlContent);
	return clean;
}

function sanitizeHtmlToDom(htmlContent) {
	const clean = DOMPurify.sanitize(htmlContent, {
		RETURN_DOM: true,
	});
	return clean;
}

export { sanitizeHtml, sanitizeHtmlToDom };
