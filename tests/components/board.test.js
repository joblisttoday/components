import { expect, test, vi, beforeEach, afterEach } from "vitest";
import JoblistBoard from "../../src/components/board.js";

// Mock the providers
vi.mock("../../src/providers/index.js", () => ({
  default: {
    getProvider: vi.fn(),
    getProviders: vi.fn(() => [
      { name: "greenhouse", hostname: "boards.greenhouse.io" },
      { name: "lever", hostname: "jobs.lever.co" }
    ])
  },
  getProvider: vi.fn(),
  getProviders: vi.fn(() => [
    { name: "greenhouse", hostname: "boards.greenhouse.io" },
    { name: "lever", hostname: "jobs.lever.co" }
  ])
}));

beforeEach(() => {
  if (!customElements.get("joblist-board")) {
    customElements.define("joblist-board", JoblistBoard);
  }
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = "";
});

test("board component renders without provider", () => {
  const board = document.createElement("joblist-board");
  document.body.appendChild(board);
  
  expect(board).toBeInstanceOf(JoblistBoard);
  expect(board.providerName).toBe("");
  expect(board.providerHostname).toBe("");
});

test("board component gets attributes correctly", () => {
  const board = document.createElement("joblist-board");
  board.setAttribute("provider-name", "greenhouse");
  board.setAttribute("provider-hostname", "boards.greenhouse.io");
  
  expect(board.providerName).toBe("greenhouse");
  expect(board.providerHostname).toBe("boards.greenhouse.io");
});

test("board component loads jobs from provider", async () => {
  const { getProvider } = await import("../../src/providers/index.js");
  
  const mockProvider = {
    getJobs: vi.fn().mockResolvedValue([
      {
        id: "job1",
        title: "Software Engineer",
        location: "San Francisco",
        description: "Great job",
        url: "https://example.com/job1"
      },
      {
        id: "job2", 
        title: "Product Manager",
        location: "Remote",
        description: "Another great job",
        url: "https://example.com/job2"
      }
    ])
  };
  
  getProvider.mockReturnValue(mockProvider);
  
  const board = document.createElement("joblist-board");
  board.setAttribute("provider-name", "greenhouse");
  board.setAttribute("provider-hostname", "boards.greenhouse.io");
  document.body.appendChild(board);
  
  // Wait for async job loading
  await new Promise(resolve => setTimeout(resolve, 100));
  
  expect(getProvider).toHaveBeenCalledWith("greenhouse");
  expect(mockProvider.getJobs).toHaveBeenCalled();
});

test("board component handles provider loading error", async () => {
  const { getProvider } = await import("../../src/providers/index.js");
  
  const mockProvider = {
    getJobs: vi.fn().mockRejectedValue(new Error("Failed to load jobs"))
  };
  
  getProvider.mockReturnValue(mockProvider);
  
  const board = document.createElement("joblist-board");
  board.setAttribute("provider-name", "greenhouse");
  board.setAttribute("provider-hostname", "boards.greenhouse.io");
  
  // Should not throw error
  expect(() => {
    document.body.appendChild(board);
  }).not.toThrow();
});

test("board component displays job count", async () => {
  const { getProvider } = await import("../../src/providers/index.js");
  
  const mockJobs = Array.from({ length: 5 }, (_, i) => ({
    id: `job${i}`,
    title: `Job ${i}`,
    location: "Remote",
    description: "Description",
    url: `https://example.com/job${i}`
  }));
  
  const mockProvider = {
    getJobs: vi.fn().mockResolvedValue(mockJobs)
  };
  
  getProvider.mockReturnValue(mockProvider);
  
  const board = document.createElement("joblist-board");
  board.setAttribute("provider-name", "greenhouse");
  board.setAttribute("provider-hostname", "boards.greenhouse.io");
  document.body.appendChild(board);
  
  // Wait for async job loading and rendering
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Should have job elements rendered
  const jobElements = board.querySelectorAll("joblist-board-job");
  expect(jobElements.length).toBe(5);
});

test("board component handles empty job list", async () => {
  const { getProvider } = await import("../../src/providers/index.js");
  
  const mockProvider = {
    getJobs: vi.fn().mockResolvedValue([])
  };
  
  getProvider.mockReturnValue(mockProvider);
  
  const board = document.createElement("joblist-board");
  board.setAttribute("provider-name", "greenhouse");
  board.setAttribute("provider-hostname", "boards.greenhouse.io");
  document.body.appendChild(board);
  
  // Wait for async job loading
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const jobElements = board.querySelectorAll("joblist-board-job");
  expect(jobElements.length).toBe(0);
});

test("board component shows loading state initially", () => {
  const board = document.createElement("joblist-board");
  board.setAttribute("provider-name", "greenhouse");
  board.setAttribute("provider-hostname", "boards.greenhouse.io");
  document.body.appendChild(board);
  
  // Should show some indication of loading (implementation dependent)
  expect(board.innerHTML).toBeTruthy();
});