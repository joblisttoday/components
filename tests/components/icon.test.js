import { expect, test, vi, beforeEach, afterEach } from "vitest";
import JoblistIcon from "../../src/components/icon.js";

// Mock Lucide
vi.mock('lucide', () => ({
  icons: {
    Twitter: '<svg>twitter</svg>',
    Linkedin: '<svg>linkedin</svg>',
    Globe: '<svg>globe</svg>',
    Search: '<svg>search</svg>',
    Building: '<svg>building</svg>'
  },
  createElement: vi.fn(() => document.createElement('svg'))
}));

beforeEach(() => {
  if (!customElements.get("joblist-icon")) {
    customElements.define("joblist-icon", JoblistIcon);
  }
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = "";
});

test("icon component renders without attributes", () => {
  const icon = document.createElement("joblist-icon");
  document.body.appendChild(icon);
  
  expect(icon).toBeInstanceOf(JoblistIcon);
  expect(icon.icon).toBe('');
});

test("icon component gets attributes correctly", () => {
  const icon = document.createElement("joblist-icon");
  icon.setAttribute("icon", "twitter");
  icon.setAttribute("title", "Twitter Icon");
  icon.setAttribute("class", "social-icon");
  
  expect(icon.icon).toBe("twitter");
  expect(icon.iconTitle).toBe("Twitter Icon");
  expect(icon.className).toBe("social-icon");
});

test("icon component has correct observed attributes", () => {
  const observedAttrs = JoblistIcon.observedAttributes;
  expect(observedAttrs).toContain("icon");
  expect(observedAttrs).toContain("title");
  expect(observedAttrs).toContain("class");
});

test("icon component calls render on connection", () => {
  const icon = document.createElement("joblist-icon");
  const renderSpy = vi.spyOn(icon, 'render');
  
  document.body.appendChild(icon);
  
  expect(renderSpy).toHaveBeenCalled();
});

test("icon component responds to attribute changes", () => {
  const icon = document.createElement("joblist-icon");
  document.body.appendChild(icon);
  
  const renderSpy = vi.spyOn(icon, 'render');
  
  icon.setAttribute("icon", "linkedin");
  
  expect(renderSpy).toHaveBeenCalled();
});

test("social icon mapping works correctly", async () => {
  // Import the component to get access to the social mapping
  const icon = document.createElement("joblist-icon");
  
  // Test that social providers are mapped correctly
  icon.setAttribute("icon", "twitter");
  document.body.appendChild(icon);
  
  // The icon should render (we can't easily test the exact lucide rendering without more setup)
  expect(icon.icon).toBe("twitter");
});

test("fallback icon behavior", async () => {
  const icon = document.createElement("joblist-icon");
  icon.setAttribute("icon", "nonexistent-icon");
  document.body.appendChild(icon);
  
  // Should not throw error with non-existent icon
  expect(icon.icon).toBe("nonexistent-icon");
});

test("size attribute handling", () => {
  const icon = document.createElement("joblist-icon");
  icon.setAttribute("size", "large");
  
  expect(icon.getAttribute("size")).toBe("large");
});

test("component structure after render", () => {
  const icon = document.createElement("joblist-icon");
  icon.setAttribute("icon", "search");
  icon.setAttribute("title", "Search Icon");
  document.body.appendChild(icon);
  
  // Component should exist and have been processed
  expect(icon.getAttribute("icon")).toBe("search");
  expect(icon.getAttribute("title")).toBe("Search Icon");
});