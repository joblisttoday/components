/**
 * @fileoverview Lever job board API integration
 * @see {@link https://partnerexperience.lever.co/hc/en-us/articles/5136514106253}
 */

/**
 * @typedef {Object} LeverJobCategories
 * @property {string} location - Job location
 * @property {string} [commitment] - Employment type (Full Time, Part Time, etc.)
 * @property {string} [department] - Department name
 * @property {string} [team] - Team name
 * @property {string[]} [allLocations] - Array of all job locations
 */

/**
 * @typedef {Object} LeverJobList
 * @property {string} text - List section title
 * @property {string} content - HTML list content
 */

/**
 * @typedef {Object} LeverApiJob
 * @property {string} id - Lever job ID
 * @property {string} text - Job title
 * @property {string} description - Job description (HTML format)
 * @property {string} descriptionPlain - Job description (plain text)
 * @property {string} additional - Additional content (HTML)
 * @property {string} additionalPlain - Additional content (plain text)
 * @property {number} createdAt - Unix timestamp of creation
 * @property {string|null} country - Job country
 * @property {string} hostedUrl - URL to job posting
 * @property {string} applyUrl - Direct application URL
 * @property {LeverJobCategories} categories - Job categorization
 * @property {LeverJobList[]} [lists] - Array of structured list content
 * @property {string} [workplaceType] - Workplace type (e.g., "hybrid", "remote", "onsite")
 * @property {string} [opening] - Opening section HTML content
 * @property {string} [openingPlain] - Opening section plain text
 * @property {string} [descriptionBody] - Main description body HTML
 * @property {string} [descriptionBodyPlain] - Main description body plain text
 */

import { Provider, Job } from "../utils/models.js";
import { sanitizeHtml } from "../utils/html-sanitizer.js";

const providerId = "lever";

const serializeJobs = (jobs = [], hostname, companyTitle, companyId) => {
	return jobs.map((job) => {
		const {
			id,
			text,
			description,
			descriptionPlain,
			createdAt,
			country,
			hostedUrl,
			categories: { location },
		} = job;

		let fullLocation = "";
		if (country && location) {
			fullLocation = `${location}, ${country}`;
		} else if (location) {
			fullLocation = location;
		}

		return new Job({
			id: `${providerId}-${hostname}-${id}`,
			name: text,
			description: (descriptionPlain ? sanitizeHtml(descriptionPlain) : undefined) || (description ? sanitizeHtml(description) : undefined),
			url: hostedUrl,
			publishedDate: createdAt,
			location: fullLocation,
			companyTitle: companyTitle || hostname,
			companyId: companyId || hostname,
			providerHostname: hostname,
			providerId,
		});
	});
};

const getJobs = async ({ hostname, companyTitle = "", companyId = "" }) => {
	const url = `https://api.lever.co/v0/postings/${hostname}`;
	let allJobs = [];
	try {
		const response = await fetch(url);
		const data = await response.json();
		if (!Array.isArray(data)) {
			throw Error(`Company ${companyId} not found`);
		}
		allJobs = data;
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
