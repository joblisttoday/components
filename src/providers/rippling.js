/**
	 Docs: https://developer.rippling.com/documentation/job-board-api-v2/reference/get-board-slug-jobs
 */

import { Provider, Job } from "../utils/models.js";

const providerId = "rippling";

const serializeJobs = (jobs = [], hostname, companyTitle, companyId) => {
	// Rippling jobs do not include a createdAt date – default to now
	const now = Date.now();

	return jobs.map((job) => {
		// Determine location from the first location object
		let fullLocation = "";
		if (job.locations && job.locations.length > 0) {
			const loc = job.locations[0];
			if (loc.city && loc.country) {
				fullLocation = `${loc.city}, ${loc.country}`;
			} else if (loc.name) {
				fullLocation = loc.name;
			}
		}

		return new Job({
			id: `${providerId}-${hostname}-${job.id}`,
			name: job.name,
			url: job.url,
			publishedDate: now,
			location: fullLocation,
			companyTitle: companyTitle || hostname,
			companyId: companyId || hostname,
			providerHostname: hostname,
			providerId,
		});
	});
};

const getJobs = async ({ hostname, companyTitle = "", companyId = "" }) => {
	let allJobs = [];
	let currentPage = 0;
	let totalPages = 1;

	try {
		// Loop through all pages of results
		while (currentPage < totalPages) {
			const url = `https://api.rippling.com/platform/api/ats/v2/board/${hostname}/jobs?page=${currentPage}`;
			const response = await fetch(url);
			const data = await response.json();

			if (!data || !data.items) {
				throw new Error(`Company ${companyId} not found`);
			}

			allJobs = allJobs.concat(data.items);
			totalPages = data.totalPages;
			currentPage++;
		}
	} catch (error) {
		console.log(`error fetching ${hostname} jobs`, url, error);
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
