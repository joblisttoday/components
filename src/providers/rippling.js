/**
 * @fileoverview Rippling job board API integration
 * @see {@link https://developer.rippling.com/documentation/job-board-api-v2/reference/get-board-slug-jobs}
 */

/**
 * @typedef {Object} RipplingJobLocation
 * @property {string} [city] - City name
 * @property {string} [country] - Country name
 * @property {string} [name] - Location name (fallback)
 */

/**
 * @typedef {Object} RipplingApiJob
 * @property {string} id - Rippling job ID
 * @property {string} name - Job title
 * @property {string} url - Direct URL to job posting
 * @property {RipplingJobLocation[]} locations - Array of job locations
 */

/**
 * @typedef {Object} RipplingApiResponse
 * @property {RipplingApiJob[]} items - Array of job postings
 * @property {number} totalPages - Total number of pages
 * @property {number} page - Current page number
 */

import { Provider, Job } from "../utils/models.js";

const providerId = "rippling";

const serializeJobs = (jobs = [], hostname, companyTitle, companyId) => {
    return jobs.map((job) => {
        // Determine location from all locations, concatenated
        let fullLocation = "";
        if (Array.isArray(job.locations) && job.locations.length > 0) {
            const parts = job.locations.map((loc) => {
                if (loc.city && loc.country) return `${loc.city}, ${loc.country}`;
                if (loc.name) return loc.name;
                return "";
            }).filter(Boolean);
            fullLocation = Array.from(new Set(parts)).join(', ');
        }

        return new Job({
            id: job.id,
            name: job.name,
            url: job.url,
            publishedDate: undefined, // Rippling API does not provide publication dates
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
