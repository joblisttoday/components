import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../src/libs/sdk-duckdb.js", () => {
	class MockDuckDbSDK {
		constructor() {
			this.initialize = vi.fn().mockResolvedValue();
			this.getStats = vi
				.fn()
				.mockResolvedValue({
					total_companies: 2,
					total_jobs: 3,
					generated_at: "2024-01-01 00:00:00",
				});
		}
	}
	return { JoblistDuckDBSDK: MockDuckDbSDK };
});

import JoblistStats from "../../src/components/stats.js";

describe("JoblistStats component", () => {
	beforeEach(() => {
		if (!customElements.get("joblist-stats")) {
			customElements.define("joblist-stats", JoblistStats);
		}
		document.body.innerHTML = "";
		vi.clearAllMocks();
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	test("renders stats including generated_at", async () => {
		const el = document.createElement("joblist-stats");
		document.body.appendChild(el);

		await Promise.resolve();
		await Promise.resolve();

		expect(el.textContent).toContain("2 companies.");
		expect(el.textContent).toContain("3 jobs.");
		expect(el.textContent).toContain("Generated at 2024-01-01 00:00:00");
	});
});
