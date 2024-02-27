import { expect, test } from "vitest";
import sdk, { JoblistApiSDK } from "./sdk-api.js";

test("correct database url", () => {
	const mySdk = new JoblistApiSDK();
	expect(mySdk.url).toBe("https://api.joblist.today");
});
