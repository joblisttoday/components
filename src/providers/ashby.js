/* ashby
	 - https://developers.ashbyhq.com/
	 - https://developers.ashbyhq.com/reference/jobpostinginfo
	 - https://jobs.ashbyhq.com/api/non-user-graphql
	 - https://github.com/plibither8/jobber/blob/main/src/boards/ashby.ts
 */

import { Provider, Job } from "../utils/models.js";

const providerId = "ashby";

const serializeJobs = (jobs = [], hostname, companyTitle, companySlug) => {
	return jobs.map((job) => {
		const { id, title, locationName, secondaryLocations, publishedDate } = job;
		const jobUrl = `https://jobs.ashbyhq.com/${hostname}/${id}`;
		return new Job({
			providerId,
			id: `${providerId}-${hostname}-${id}`,
			name: title,
			url: jobUrl,
			publishedDate: publishedDate || Date.now(),
			companyTitle: companyTitle || hostname,
			companySlug: companySlug || hostname,
			providerHostname: hostname,
			location: [
				locationName,
				...secondaryLocations.map(({ locationName }) => locationName),
			].join(", "),
		});
	});
};

const getJobs = async ({ hostname, companyTitle = "", companySlug = "" }) => {
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
	} catch (error) {
		console.log("error fetching jobs", error);
	}

	const s = serializeJobs(allJobs, hostname, companyTitle, companySlug);
	return s;
};

const api = new Provider({
	id: providerId,
	getJobs,
});

export default api;
export { getJobs };
