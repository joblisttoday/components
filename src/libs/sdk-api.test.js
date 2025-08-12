import { expect, test, vi } from "vitest";
import sdk, { JoblistApiSDK } from "./sdk-api.js";
import { getJobs } from "../providers/personio.js";

test("correct database url", () => {
	const mySdk = new JoblistApiSDK();
	expect(mySdk.url).toBe("https://api.joblist.today");
});
