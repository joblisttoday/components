import { expect, test, vi } from "vitest";
import sdk, { JoblistApiSDK } from "../../src/libs/sdk-api.js";
import { getJobs } from "../../src/providers/personio.js";

test("correct database url", () => {
	const mySdk = new JoblistApiSDK();
	expect(mySdk.url).toBe("https://api.joblist.today");
});
