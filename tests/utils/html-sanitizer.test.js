import { describe, test, expect } from "vitest";
import { sanitizeHtml } from "../../src/utils/html-sanitizer.js";

describe("HTML Sanitizer", () => {
	describe("sanitizeHtml", () => {
		test("should allow safe HTML tags", () => {
			const input = "<p>Hello <strong>world</strong></p>";
			const result = sanitizeHtml(input);

			expect(result).toContain("<p>");
			expect(result).toContain("<strong>");
			expect(result).toContain("Hello");
			expect(result).toContain("world");
		});

		test("should remove dangerous script tags", () => {
			const input = '<p>Hello</p><script>alert("xss")</script>';
			const result = sanitizeHtml(input);

			expect(result).toContain("<p>Hello</p>");
			expect(result).not.toContain("<script>");
			expect(result).not.toContain("alert");
		});

		test("should remove dangerous attributes", () => {
			const input = "<p onclick=\"alert('xss')\">Hello</p>";
			const result = sanitizeHtml(input);

			expect(result).toContain("<p>Hello</p>");
			expect(result).not.toContain("onclick");
			expect(result).not.toContain("alert");
		});

		test("should preserve safe attributes", () => {
			const input = '<a href="https://example.com" title="Example">Link</a>';
			const result = sanitizeHtml(input);

			expect(result).toContain('href="https://example.com"');
			expect(result).toContain('title="Example"');
			expect(result).toContain("Link");
		});

		test("should handle empty or null input", () => {
			expect(sanitizeHtml("")).toBe("");
			expect(sanitizeHtml(null)).toBe("");
			expect(sanitizeHtml(undefined)).toBe("");
		});
	});
});
