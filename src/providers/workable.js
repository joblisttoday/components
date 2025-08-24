/**
 * @fileoverview Workable job board API integration
 * @see {@link https://workable.readme.io/reference/jobs-1}
 */

/**
 * @typedef {Object} WorkableApiJob
 * @property {string} title - Job title
 * @property {string} shortcode - Job shortcode identifier
 * @property {string} code - Job code (usually empty)
 * @property {string} employment_type - Employment type (Full-time, Part-time, etc.)
 * @property {boolean} telecommuting - Whether telecommuting is allowed
 * @property {string} department - Department name
 * @property {string} url - Direct URL to job posting
 * @property {string} shortlink - Short URL to job posting
 * @property {string} application_url - URL for job application
 * @property {string} published_on - Date of publication (YYYY-MM-DD format)
 * @property {string} created_at - Date of creation (YYYY-MM-DD format)
 * @property {string} country - Job country
 * @property {string} city - Job city
 * @property {string} state - Job state/region
 * @property {string} education - Education requirements (usually empty)
 */

/**
 * @typedef {Object} WorkableWidgetResponse
 * @property {string} name - Company name
 * @property {string|null} description - Company description
 * @property {WorkableApiJob[]} jobs - Array of job postings
 */

import { Provider, Job } from "../utils/models.js";

const providerId = "workable";

const serializeJobs = (jobs = [], hostname, companyTitle, companyId) => {
	return jobs.map((job) => {
		const { id, city, country, url, title, published_on, employment_type, department } = job;
    // Build location from city/country, or mark as remote when applicable
    let locationStr = `${city}, ${country}`;
    if (!city && job.telecommuting) {
        locationStr = country ? `Remote, ${country}` : `Remote`;
    }

    return new Job({
        id: `${providerId}-${hostname}-${id}`,
        name: title,
        // Workable widget API doesn't provide job descriptions (requires auth for enhanced API)
        url: url,
        publishedDate: published_on,
        location: locationStr,
        employmentType: employment_type,
        department: department,
        companyTitle: companyTitle || hostname,
        companyId: companyId || hostname,
        providerHostname: hostname,
        providerId,
    });
	});
};

const getJobs = async ({ hostname, companyTitle = "", companyId = "", city }) => {
	const url = `https://apply.workable.com/api/v1/widget/accounts/${hostname}`;
	const options = {
		method: "GET",
		headers: {
			Accept: "application/json",
		},
		params: { details: "false" },
	};

	let allJobs = [];
	try {
		const data = await fetch(url, options).then((res) => res.json());
		if (data && Array.isArray(data.jobs)) {
			allJobs = data.jobs;
		} else {
			// Missing company data: treat as empty list (not a network error)
			allJobs = [];
		}
	} catch (error) {
		console.log(`error fetching company jobs: ${hostname}`, error);
		// Network error: signal undefined to match tests
		return;
	}

	// Optional city filter
	if (city) {
		const search = String(city).toLowerCase();
		allJobs = allJobs.filter((job) => (job.city || "").toLowerCase().includes(search));
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
