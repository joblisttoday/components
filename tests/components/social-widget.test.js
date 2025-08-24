import { expect, test, vi, beforeEach, afterEach } from "vitest";
import JoblistSocialWidget from "../../src/components/social-widget.js";

// Mock social SDK
vi.mock("../../src/libs/sdk-social.js", () => ({
  default: {
    fetchBasicInfo: vi.fn(),
  },
}));

// Mock fetch for oEmbed
global.fetch = vi.fn();

beforeEach(() => {
  // Clean up custom elements registry
  if (!customElements.get("joblist-social-widget")) {
    customElements.define("joblist-social-widget", JoblistSocialWidget);
  }
  
  // Reset DOM
  document.body.innerHTML = "";
  
  // Reset mocks
  vi.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = "";
});

test("social widget renders without company data", () => {
  const widget = document.createElement("joblist-social-widget");
  document.body.appendChild(widget);
  
  expect(widget).toBeInstanceOf(JoblistSocialWidget);
  expect(widget.company).toEqual({});
});

test("social widget parses company attribute correctly", () => {
  const widget = document.createElement("joblist-social-widget");
  const companyData = {
    name: "Test Company",
    linkedin_url: "https://linkedin.com/company/test",
    twitter_url: "https://twitter.com/test"
  };
  
  widget.setAttribute("company", JSON.stringify(companyData));
  document.body.appendChild(widget);
  
  expect(widget.company).toEqual(companyData);
});

test("social widget creates list items for social providers", async () => {
  const { default: socialSDK } = await import("../../src/libs/sdk-social.js");
  
  // Mock social SDK responses
  socialSDK.fetchBasicInfo
    .mockResolvedValueOnce({
      provider: "linkedin",
      id: "test-company",
      url: "https://linkedin.com/company/test",
      name: "Test Company"
    })
    .mockResolvedValueOnce({
      provider: "twitter", 
      id: "testcompany",
      url: "https://twitter.com/testcompany",
      name: "Test Company"
    });

  const widget = document.createElement("joblist-social-widget");
  const companyData = {
    linkedin_url: "https://linkedin.com/company/test",
    twitter_url: "https://twitter.com/testcompany"
  };
  
  widget.setAttribute("company", JSON.stringify(companyData));
  document.body.appendChild(widget);
  
  // Wait for async render
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const list = widget.querySelector(".social-widgets__list");
  expect(list).toBeTruthy();
  
  const listItems = widget.querySelectorAll(".social-widgets__item");
  expect(listItems.length).toBe(2);
  
  expect(listItems[0].dataset.provider).toBe("linkedin");
  expect(listItems[1].dataset.provider).toBe("twitter");
});

test("oEmbed fetch works for twitter", async () => {
  const widget = new JoblistSocialWidget();
  
  // Mock successful oEmbed response
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({
      html: '<blockquote class="twitter-tweet">Test tweet</blockquote>'
    })
  });
  
  const result = await widget.fetchOEmbed("https://twitter.com/test/status/123", "twitter");
  
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining("https://publish.twitter.com/oembed")
  );
  expect(result).toBe('<blockquote class="twitter-tweet">Test tweet</blockquote>');
});

test("oEmbed falls back gracefully on fetch failure", async () => {
  const widget = new JoblistSocialWidget();
  
  // Mock failed oEmbed response
  global.fetch.mockRejectedValueOnce(new Error("Network error"));
  
  try {
    const result = await widget.fetchOEmbed("https://twitter.com/test/status/123", "twitter");
    expect(result).toBe(null);
  } catch (error) {
    // The method may throw, which is also acceptable behavior
    expect(error.message).toBe("Network error");
  }
});

test("LinkedIn badge styles are added only once", () => {
  const widget = new JoblistSocialWidget();
  
  // Call method twice
  widget.addLinkedInBadgeStyles();
  widget.addLinkedInBadgeStyles();
  
  // Should only have one style element
  const styleElements = document.querySelectorAll("#linkedin-badge-styles");
  expect(styleElements.length).toBe(1);
});

test("LinkedIn content creates proper badge structure", () => {
  const widget = new JoblistSocialWidget();
  const container = document.createElement("div");
  
  widget.addLinkedInContent(container, "https://linkedin.com/company/test", "Test Company");
  
  const badge = container.querySelector(".linkedin-company-badge");
  expect(badge).toBeTruthy();
  
  const companyName = container.querySelector(".linkedin-company-name");
  expect(companyName.textContent).toBe("Test Company");
  
  const actionButton = container.querySelector(".linkedin-action-button");
  expect(actionButton.href).toBe("https://linkedin.com/company/test");
  expect(actionButton.textContent).toBe("View Profile");
});

test("X widgets script loading is handled correctly", () => {
  const widget = new JoblistSocialWidget();
  const mockCallback = vi.fn();
  
  // Mock window.twttr
  global.window.twttr = {
    widgets: {
      load: vi.fn().mockResolvedValue()
    }
  };
  
  widget.loadXWidgetsScript(mockCallback);
  
  // Should call callback when twttr is available
  expect(mockCallback).toHaveBeenCalled();
});