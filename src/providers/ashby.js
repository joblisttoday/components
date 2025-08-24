/**
 * @fileoverview Ashby job board API integration
 * @see {@link https://developers.ashbyhq.com/}
 */

/**
 * @typedef {Object} AshbyJobSecondaryLocation
 * @property {string} locationName - Secondary location name
 */

/**
 * @typedef {Object} AshbyJobPosting
 * @property {string} id - Ashby job ID
 * @property {string} title - Job title
 * @property {string} locationName - Primary location name
 * @property {string} employmentType - Employment type (Full-time, Part-time, etc.)
 * @property {AshbyJobSecondaryLocation[]} secondaryLocations - Additional locations
 */

/**
 * @typedef {Object} AshbyJobDetails
 * @property {string} descriptionHtml - Job description in HTML format
 */

/**
 * @typedef {Object} AshbyBoardResponse
 * @property {Object} data - GraphQL response wrapper
 * @property {Object} data.jobBoard - Job board data
 * @property {AshbyJobPosting[]} data.jobBoard.jobPostings - Array of job postings
 */

/**
 * @typedef {Object} AshbyJobDetailsResponse
 * @property {Object} data - GraphQL response wrapper
 * @property {AshbyJobDetails} data.jobPosting - Job details
 */

import { Provider, Job } from "../utils/models.js";
import { sanitizeHtml } from "../utils/html-sanitizer.js";

const providerId = "ashby";

const serializeJobs = (jobs = [], hostname, companyTitle, companyId) => {
	return jobs.map((job) => {
		const { id, title, locationName, secondaryLocations, publishedDate, description, employmentType } = job;
		const jobUrl = `https://jobs.ashbyhq.com/${hostname}/${id}`;
		return new Job({
			providerId,
			id: `${providerId}-${hostname}-${id}`,
			name: title,
			description: description ? sanitizeHtml(description) : undefined,
			url: jobUrl,
			publishedDate: publishedDate,
			employmentType: employmentType,
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

const getJobs = async ({ hostname, companyTitle = "", companyId = "", city }) => {
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
			// GraphQL error or missing board: treat as empty
			allJobs = [];
		} else {
			allJobs = data.jobBoard.jobPostings || [];
		}

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
		return;
	}

	// Optional city filter (match against primary and secondary locations)
	if (city) {
		const q = String(city).toLowerCase();
		allJobs = allJobs.filter((job) => {
			const primary = (job.locationName || "").toLowerCase();
			const secondaries = (job.secondaryLocations || [])
				.map((s) => (s.locationName || "").toLowerCase())
				.join(" ");
			return primary.includes(q) || secondaries.includes(q);
		});
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
