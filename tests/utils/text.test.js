import { expect, test } from "vitest";
import text from "../../src/utils/text.js";

test("text utility looks up dictionary entries correctly", () => {
  expect(text("company_url")).toBe("homepage");
  expect(text("job_board_url")).toBe("careers");
  expect(text("linkedin_url")).toBe("linkedin");
});

test("text utility handles unknown keys", () => {
  expect(text("unknown_key")).toBe("");
  expect(text("nonexistent")).toBe("");
});

test("text utility handles social media URLs", () => {
  expect(text("twitter_url")).toBe("twitter");
  expect(text("linkedin_url")).toBe("linkedin");
  expect(text("youtube_url")).toBe("youtube");
  expect(text("facebook_url")).toBe("facebook");
  expect(text("instagram_url")).toBe("instagram");
});

test("text utility handles Wikipedia URL", () => {
  expect(text("wikipedia_url")).toBe("wikipedia");
});

test("text utility handles empty strings", () => {
  expect(text("")).toBe("");
});

test("text utility returns empty string for unmapped keys", () => {
  expect(text("unmapped_key")).toBe("");
  expect(text("camelCaseKey")).toBe("");
});