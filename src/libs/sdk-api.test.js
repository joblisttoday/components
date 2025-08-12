import { expect, test, vi } from "vitest";
import sdk, { JoblistApiSDK } from "./sdk-api.js";
import { getJobs } from "../providers/personio.js";

test("correct database url", () => {
	const mySdk = new JoblistApiSDK();
	expect(mySdk.url).toBe("https://api.joblist.today");
});

test("personio getJobs fetches and parses jobs correctly", async () => {
	const mockXmlResponse = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<workzag-jobs>
  <position>
    <id>12345</id>
    <name>Software Engineer</name>
    <office>Munich</office>
    <createdAt>2023-01-01</createdAt>
    <jobDescriptions>
      <jobDescription>
        <name>Job Description</name>
        <value><![CDATA[<p>This is a <b>test</b> job description.</p>]]></value>
      </jobDescription>
    </jobDescriptions>
  </position>
</workzag-jobs>`;

	global.fetch = vi.fn(() =>
		Promise.resolve({
			status: 200,
			text: () => Promise.resolve(mockXmlResponse),
		})
	);

	const jobs = await getJobs({ hostname: "example" });

	expect(jobs).toHaveLength(1);
	expect(jobs[0].id).toBe("personio-example-12345");
	expect(jobs[0].name).toBe("Software Engineer");
	expect(jobs[0].location).toBe("Munich");
	expect(jobs[0].description).toContain("This is a test job description.");
	expect(global.fetch).toHaveBeenCalledWith("https://example.jobs.personio.de/xml?language=en");
});