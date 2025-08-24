import { expect, test } from "vitest";
import text from "../../src/utils/text.js";

test("text utility converts camelCase to readable text", () => {
  expect(text("companyUrl")).toBe("company url");
  expect(text("jobBoardUrl")).toBe("job board url");
  expect(text("linkedinUrl")).toBe("linkedin url");
});

test("text utility handles snake_case", () => {
  expect(text("company_url")).toBe("company url");
  expect(text("job_board_url")).toBe("job board url");
  expect(text("linkedin_url")).toBe("linkedin url");
});

test("text utility handles kebab-case", () => {
  expect(text("company-url")).toBe("company url");
  expect(text("job-board-url")).toBe("job board url");
  expect(text("linkedin-url")).toBe("linkedin url");
});

test("text utility handles single words", () => {
  expect(text("company")).toBe("company");
  expect(text("job")).toBe("job");
  expect(text("url")).toBe("url");
});

test("text utility handles empty strings", () => {
  expect(text("")).toBe("");
});

test("text utility handles already formatted text", () => {
  expect(text("company url")).toBe("company url");
  expect(text("job board url")).toBe("job board url");
});