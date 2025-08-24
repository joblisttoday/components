import { expect, test, vi, beforeEach } from "vitest";
import { getJobs } from "../../src/providers/greenhouse.js";

// Mock fetch
global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

test("greenhouse provider fetches jobs correctly", async () => {
  const mockJobs = {
    jobs: [
      {
        id: 123,
        title: "Software Engineer",
        location: {
          name: "San Francisco, CA"
        },
        content: "Job description here",
        absolute_url: "https://boards.greenhouse.io/company/jobs/123",
        updated_at: "2024-01-01T00:00:00Z"
      }
    ]
  };
  
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockJobs)
  });
  
  const jobs = await getJobs({ hostname: "company" });
  
  expect(fetch).toHaveBeenCalledWith("https://boards-api.greenhouse.io/v1/boards/company/jobs?content=true");
  expect(jobs).toHaveLength(1);
  expect(jobs[0].name).toBe("Software Engineer");
  expect(jobs[0].location).toBe("San Francisco, CA");
  expect(jobs[0].url).toBe("https://boards.greenhouse.io/company/jobs/123");
});

test("greenhouse provider handles empty response", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ jobs: [] })
  });
  
  const jobs = await getJobs({ hostname: "company" });
  
  expect(jobs).toHaveLength(0);
});

test("greenhouse provider handles fetch error", async () => {
  global.fetch.mockRejectedValueOnce(new Error("Network error"));
  
  const jobs = await getJobs({ hostname: "company" });
  expect(jobs).toBeUndefined();
});

test("greenhouse provider handles HTTP error", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 404,
    statusText: "Not Found",
    json: () => Promise.reject(new Error("Not Found"))
  });
  
  const jobs = await getJobs({ hostname: "company" });
  expect(jobs).toBeUndefined();
});

test("greenhouse provider transforms job data correctly", async () => {
  const mockJobs = {
    jobs: [
      {
        id: 456,
        title: "Backend Developer",
        location: {
          name: "Remote"
        },
        content: "<p>Work remotely</p>",
        absolute_url: "https://boards.greenhouse.io/company/jobs/456",
        updated_at: "2024-01-01T00:00:00Z",
        departments: [
          { name: "Engineering" }
        ]
      }
    ]
  };
  
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockJobs)
  });
  
  const jobs = await getJobs({ hostname: "company" });
  
  expect(jobs[0].id).toContain("greenhouse-company-456");
  expect(jobs[0].name).toBe("Backend Developer");
  expect(jobs[0].location).toBe("Remote");
  expect(jobs[0].description).toBe("Work remotely");
  expect(jobs[0].url).toBe("https://boards.greenhouse.io/company/jobs/456");
});

test("greenhouse provider handles missing location gracefully", async () => {
  const mockJobs = {
    jobs: [
      {
        id: 789,
        title: "Frontend Developer",
        content: "Frontend role",
        absolute_url: "https://boards.greenhouse.io/company/jobs/789",
        updated_at: "2024-01-01T00:00:00Z",
        location: {}
      }
    ]
  };
  
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockJobs)
  });
  
  const jobs = await getJobs({ hostname: "company" });
  
  expect(jobs[0].location).toBe("");
});