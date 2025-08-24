import { expect, test, vi, beforeEach, afterEach } from "vitest";
import JoblistMenu from "../../src/components/menu.js";

beforeEach(() => {
  if (!customElements.get("joblist-menu")) {
    customElements.define("joblist-menu", JoblistMenu);
  }
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = "";
});

test("menu component renders", () => {
  const menu = document.createElement("joblist-menu");
  document.body.appendChild(menu);
  
  expect(menu).toBeInstanceOf(JoblistMenu);
});

test("menu component gets attributes correctly", () => {
  const menu = document.createElement("joblist-menu");
  menu.setAttribute("show-favicon", "true");
  menu.setAttribute("show-default", "true");
  
  expect(menu.getAttribute("show-favicon")).toBe("true");
  expect(menu.getAttribute("show-default")).toBe("true");
});

test("menu component shows favicon when attribute is set", () => {
  const menu = document.createElement("joblist-menu");
  menu.setAttribute("show-favicon", "true");
  document.body.appendChild(menu);
  
  // Check if favicon element exists (implementation dependent)
  expect(menu.querySelector("joblist-favicon")).toBeTruthy();
});

test("menu component includes default menu items when show-default is true", () => {
  const menu = document.createElement("joblist-menu");
  menu.setAttribute("show-default", "true");
  document.body.appendChild(menu);
  
  // Should have default navigation items
  const menuElement = menu.querySelector("menu");
  expect(menuElement).toBeTruthy();
});

test("menu component preserves existing content", () => {
  const menu = document.createElement("joblist-menu");
  menu.innerHTML = '<menu><li><a href="/custom">Custom Link</a></li></menu>';
  document.body.appendChild(menu);
  
  // Should preserve existing menu items
  expect(menu.innerHTML).toContain("Custom Link");
});

test("menu component handles empty content gracefully", () => {
  const menu = document.createElement("joblist-menu");
  document.body.appendChild(menu);
  
  // Should not throw error with empty content
  expect(menu.innerHTML).toBeTruthy();
});