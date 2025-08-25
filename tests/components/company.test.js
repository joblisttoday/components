import { expect, test, vi, beforeEach, afterEach } from "vitest";
import JoblistCompany from "../../src/components/company.js";

// Mock the SDK
vi.mock("../../src/libs/sdk-duckdb.js", () => ({
  default: {
    initialize: vi.fn(),
    getCompany: vi.fn()
  },
  JoblistDuckDBSDK: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    getCompany: vi.fn()
  }))
}));

// Mock giscus
vi.mock("giscus", () => ({}));

beforeEach(() => {
  if (!customElements.get("joblist-company")) {
    customElements.define("joblist-company", JoblistCompany);
  }
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = "";
});

test("company component renders without company data", () => {
  const company = document.createElement("joblist-company");
  document.body.appendChild(company);
  
  expect(company).toBeInstanceOf(JoblistCompany);
  expect(company.full).toBe(false);
});

test("company component gets attributes correctly", () => {
  const company = document.createElement("joblist-company");
  company.setAttribute("full", "true");
  company.setAttribute("origin", "https://example.com");
  company.setAttribute("company-id", "test-company");
  
  expect(company.full).toBe(true);
  expect(company.origin).toBe("https://example.com");
  expect(company.companyId).toBe("test-company");
});

test("company component parses company JSON attribute", () => {
  const company = document.createElement("joblist-company");
  const companyData = {
    id: "test-company",
    title: "Test Company",
    description: "A test company"
  };
  
  company.setAttribute("company", JSON.stringify(companyData));
  
  expect(company.company).toEqual(companyData);
});

test("company component builds profile URL correctly", () => {
  const company = document.createElement("joblist-company");
  company.setAttribute("origin", "https://joblist.today");
  
  const url = company.buildProfileUrl("test-company");
  expect(url).toBe("https://joblist.today/test-company");
});

test("company component renders no company message when no data", async () => {
  const company = document.createElement("joblist-company");
  company.setAttribute("company-id", "nonexistent");
  document.body.appendChild(company);
  
  // Should initially show loading message
  expect(company.textContent).toContain("Loading company nonexistent...");
  
  // Wait for async loading to complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Should show no company message after loading fails
  expect(company.textContent).toContain("No company nonexistent");
});

test("company component creates favicon element", () => {
  const company = new JoblistCompany();
  const companyData = {
    company_url: "https://example.com"
  };
  
  const favicon = company.createFavicon(companyData);
  
  expect(favicon.tagName.toLowerCase()).toBe("joblist-company-favicon");
  const img = favicon.querySelector("img");
  expect(img.src).toContain("icons.duckduckgo.com");
});

test("company component handles invalid company URL in favicon", () => {
  const company = new JoblistCompany();
  const companyData = {
    company_url: "not-a-valid-url"
  };
  
  // Should handle invalid URL gracefully and return empty favicon element
  const favicon = company.createFavicon(companyData);
  expect(favicon.tagName.toLowerCase()).toBe("joblist-company-favicon");
  expect(favicon.innerHTML).toBe(""); // Should be empty due to invalid URL
});

test("company component creates description element", () => {
  const company = new JoblistCompany();
  const companyData = {
    description: "This is a test company description"
  };
  
  const description = company.createDescription(companyData);
  
  expect(description.tagName.toLowerCase()).toBe("joblist-company-description");
  expect(description.textContent).toContain("This is a test company description");
});

test("company component returns empty string for no description", () => {
  const company = new JoblistCompany();
  const companyData = {};
  
  const description = company.createDescription(companyData);
  
  expect(description).toBe("");
});

test("company component creates tags wrapper", () => {
  const company = new JoblistCompany();
  const companyData = {
    tags: [
      { name: "JavaScript", slug: "javascript" },
      { name: "Remote", slug: "remote" }
    ]
  };
  
  const tags = company.createTags(companyData);
  
  expect(tags.tagName.toLowerCase()).toBe("joblist-company-tags");
  const menu = tags.querySelector("menu");
  expect(menu).toBeTruthy();
  expect(menu.children.length).toBe(2);
});

test("company component handles no tags gracefully", () => {
  const company = new JoblistCompany();
  const companyData = { tags: [] };
  
  const tags = company.createTags(companyData);
  
  expect(tags).toBe("");
});

test("company component creates highlight element for highlighted companies", () => {
  const company = new JoblistCompany();
  const companyData = {
    title: "Test Company",
    is_highlighted: true
  };
  
  const highlight = company.createHighlight(companyData);
  
  expect(highlight.tagName.toLowerCase()).toBe("joblist-highlight");
  expect(highlight.getAttribute("type")).toBe("company");
  expect(highlight.getAttribute("text")).toBe("Test Company");
});

test("company component creates board element when provider data exists", () => {
  const company = new JoblistCompany();
  const companyData = {
    job_board_provider: "greenhouse",
    job_board_hostname: "boards.greenhouse.io"
  };
  
  const board = company.createBoard(companyData);
  
  expect(board.tagName.toLowerCase()).toBe("joblist-board");
  expect(board.getAttribute("provider-name")).toBe("greenhouse");
  expect(board.getAttribute("provider-hostname")).toBe("boards.greenhouse.io");
});

test("company component returns empty string when no board provider data", () => {
  const company = new JoblistCompany();
  const companyData = {};
  
  const board = company.createBoard(companyData);
  
  expect(board).toBe("");
});

test("company component handles initialization with SDK", async () => {
  const { default: sdk, JoblistDuckDBSDK } = await import("../../src/libs/sdk-duckdb.js");
  
  // Set up mocks before component is created
  sdk.initialize = vi.fn().mockResolvedValue();
  sdk.getCompany = vi.fn().mockResolvedValue({
    id: "test-company",
    title: "Test Company"
  });
  
  const mockConstructor = vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(),
    getCompany: vi.fn().mockResolvedValue({
      id: "test-company",
      title: "Test Company"
    })
  }));
  
  // Mock the constructor
  vi.mocked(JoblistDuckDBSDK).mockImplementation(mockConstructor);
  
  const company = document.createElement("joblist-company");
  company.setAttribute("company-id", "test-company");
  document.body.appendChild(company);
  
  // Wait for async initialization
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // The component should have used the default SDK
  expect(sdk.initialize).toHaveBeenCalled();
  expect(sdk.getCompany).toHaveBeenCalledWith("test-company");
});

test("company component handles SDK initialization failure gracefully", async () => {
  const { default: sdk } = await import("../../src/libs/sdk-duckdb.js");
  
  sdk.initialize.mockRejectedValue(new Error("SDK Error"));
  
  const company = document.createElement("joblist-company");
  company.setAttribute("company-id", "test-company");
  
  // Should not throw error
  expect(() => {
    document.body.appendChild(company);
  }).not.toThrow();
});

test("company component handles invalid JSON gracefully", () => {
  const company = document.createElement("joblist-company");
  company.setAttribute("company", "invalid-json");
  
  // Should return empty object instead of throwing
  expect(company.company).toEqual({});
});

test("company component renders with full mode", () => {
  const company = document.createElement("joblist-company");
  const companyData = {
    id: "test-company",
    title: "Test Company",
    description: "A test company",
    job_board_provider: "greenhouse",
    job_board_hostname: "boards.greenhouse.io"
  };
  
  company.setAttribute("full", "true");
  company.setAttribute("company", JSON.stringify(companyData));
  document.body.appendChild(company);
  
  expect(company.full).toBe(true);
  expect(company.querySelector("joblist-company-title")).toBeTruthy();
  expect(company.querySelector("joblist-company-description")).toBeTruthy();
});

test("company component creates heatmap when provider data exists", () => {
  const company = new JoblistCompany();
  const companyData = {
    id: "test-company",
    job_board_provider: "greenhouse",
    job_board_hostname: "boards.greenhouse.io"
  };
  
  const heatmap = company.createHeatmap(companyData);
  
  expect(heatmap.tagName.toLowerCase()).toBe("joblist-heatmap");
  expect(heatmap.getAttribute("company-id")).toBe("test-company");
});

test("company component returns empty string for heatmap when no provider data", () => {
  const company = new JoblistCompany();
  const companyData = {};
  
  const heatmap = company.createHeatmap(companyData);
  
  expect(heatmap).toBe("");
});

test("company component creates favicon with empty company_url", () => {
  const company = new JoblistCompany();
  const companyData = { company_url: "" };
  
  const favicon = company.createFavicon(companyData);
  
  expect(favicon.tagName.toLowerCase()).toBe("joblist-company-favicon");
  expect(favicon.innerHTML).toBe("");
});