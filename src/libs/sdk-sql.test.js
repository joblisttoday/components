import { expect, test } from "vitest";
import sdk, { JoblistSqlSDK } from "./sdk-sql.js";

test("correct database url", () => {
	const mySdk = new JoblistSqlSDK();
	expect(mySdk.url).toBe("https://workers.joblist.today/joblist.db");
});
