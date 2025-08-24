/**
 * @fileoverview HTML sanitization utilities using DOMPurify
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} htmlContent - Raw HTML content to sanitize
 * @returns {string} Sanitized HTML string
 */
export default function sanitizeHtml(htmlContent) {
	if (!htmlContent) return "";
	const clean = DOMPurify.sanitize(htmlContent);
	return clean;
}

/**
 * Sanitize HTML content and return as DOM elements
 * @param {string} htmlContent - Raw HTML content to sanitize
 * @returns {DocumentFragment} Sanitized DOM fragment
 */
function sanitizeHtmlToDom(htmlContent) {
	const clean = DOMPurify.sanitize(htmlContent || "", {
		RETURN_DOM: true,
	});
	return clean;
}

export { sanitizeHtml, sanitizeHtmlToDom };
