/* ashby
	 - https://developers.ashbyhq.com/
	 - https://developers.ashbyhq.com/reference/jobpostinginfo
	 - https://jobs.ashbyhq.com/api/non-user-graphql
	 - https://github.com/plibither8/jobber/blob/main/src/boards/ashby.ts
 */

import { Provider, Job } from "../utils/models.js";
import { sanitizeHtml } from "../utils/html-sanitizer.js";

const providerId = "ashby";

const serializeJobs = (jobs = [], hostname, companyTitle, companyId) => {
	return jobs.map((job) => {
		const { id, title, locationName, secondaryLocations, publishedDate, description } = job;
		const jobUrl = `https://jobs.ashbyhq.com/${hostname}/${id}`;
		return new Job({
			providerId,
			id: `${providerId}-${hostname}-${id}`,
			name: title,
			description: description ? sanitizeHtml(description) : undefined,
			url: jobUrl,
			publishedDate: publishedDate || Date.now(),
			companyTitle: companyTitle || hostname,
			companyId: companyId || hostname,
			providerHostname: hostname,
			location: [
				locationName,
				...secondaryLocations.map(({ locationName }) => locationName),
			].join(", "),
		});
	});
};

const getJobDetails = async (jobId, hostname) => {
	const url = "https://jobs.ashbyhq.com/api/non-user-graphql";
	const body = {
		operationName: "ApiJobPosting",
		variables: {
			organizationHostedJobsPageName: hostname,
			jobPostingId: jobId,
		},
		query: `
			query ApiJobPosting($organizationHostedJobsPageName: String!, $jobPostingId: String!) {
				jobPosting(organizationHostedJobsPageName: $organizationHostedJobsPageName, jobPostingId: $jobPostingId) {
					descriptionHtml
				}
			}
		`,
	};

	try {
		const response = await fetch(url, {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "content-type": "application/json" },
		});
		const { data } = await response.json();
		return data?.jobPosting?.descriptionHtml || "";
	} catch (error) {
		console.log("error fetching job details", error);
		return "";
	}
};

const getJobs = async ({ hostname, companyTitle = "", companyId = "" }) => {
	const url =
		"https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiBoardWithTeams";

	const body = {
		operationName: "ApiBoardWithTeams",
		variables: {
			organizationHostedJobsPageName: hostname,
		},
		query: `
				query ApiBoardWithTeams($organizationHostedJobsPageName: String!) {
					jobBoard: jobBoardWithTeams(
						organizationHostedJobsPageName: $organizationHostedJobsPageName
					) {
						jobPostings {
							id
							title
							locationName
							employmentType
							secondaryLocations {
								locationName
							}
						}
					}
				}
			`,
	};

	let allJobs = [];
	try {
		const response = await fetch(url, {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "content-type": "application/json" },
		});
		const { data } = await response.json();
		if (!data || !data.jobBoard) {
			throw Error(`Company ${hostname} not found`);
		}
		allJobs = data.jobBoard.jobPostings || [];

		// Fetch job descriptions for all jobs
		const jobsWithDescriptions = await Promise.all(
			allJobs.map(async (job) => {
				const description = await getJobDetails(job.id, hostname);
				return { ...job, description };
			})
		);
		allJobs = jobsWithDescriptions;
	} catch (error) {
		console.log("error fetching jobs", error);
	}

	const s = serializeJobs(allJobs, hostname, companyTitle, companyId);
	return s;
};

const api = new Provider({
	id: providerId,
	getJobs,
});

export default api;
export { getJobs };
