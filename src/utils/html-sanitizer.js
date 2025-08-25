/**
 * @fileoverview Comprehensive sanitization utilities using DOMPurify
 * Treats all external API input as potentially dangerous
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

/**
 * Sanitize HTML content and extract plain text only
 * @param {string} htmlContent - Raw HTML content to sanitize
 * @returns {string} Plain text with HTML markup removed
 */
function sanitizeHtmlToText(htmlContent) {
	if (!htmlContent) return "";
	const dom = DOMPurify.sanitize(htmlContent, {
		RETURN_DOM: true,
	});
	return dom.textContent || dom.innerText || "";
}

export { sanitizeHtml, sanitizeHtmlToDom, sanitizeHtmlToText };
