/**
 * @fileoverview Recruitee job board API integration
 * @see {@link https://docs.recruitee.com/reference/offers}
 */

/**
 * @typedef {Object} RecruiteeTranslation
 * @property {Object} en - English translations
 * @property {string} en.description - Job description in HTML
 * @property {string} en.title - Job title
 * @property {string|null} en.highlight - Job highlight
 * @property {string|null} en.requirements - Job requirements
 * @property {string} en.sharing_image - Social sharing image URL
 * @property {string} en.sharing_title - Social sharing title
 * @property {string} en.sharing_description - Social sharing description
 * @property {string} en.locations_question - Location preference question
 */

/**
 * @typedef {Object} RecruiteeLocation
 * @property {number} id - Location ID
 * @property {string} name - Location name
 * @property {string} state - State/region
 * @property {string} country - Country name
 * @property {string} postal_code - Postal code
 */

/**
 * @typedef {Object} RecruiteeApiJob
 * @property {number} id - Recruitee job ID
 * @property {string} options_photo - Photo options setting
 * @property {RecruiteeTranslation} translations - Job content in different languages
 * @property {string} careers_apply_url - URL for job application
 * @property {string|null} cover_image - Cover image URL
 * @property {boolean} remote - Whether job is remote
 * @property {string} postal_code - Job postal code
 * @property {boolean} on_site - Whether job is on-site
 * @property {number} max_hours - Maximum working hours
 * @property {string} locations_question - Location preference question
 * @property {string|null} close_at - Job closing date
 * @property {RecruiteeLocation[]} locations - Array of job locations
 * @property {string} created_at - ISO timestamp of creation
 * @property {string} city - Job city
 * @property {string} country - Job country
 * @property {string} status - Job status ("published", "draft", etc.)
 * @property {string} title - Job title (derived from translations.en.title)
 * @property {string} careers_url - URL to job posting (same as careers_apply_url)
 */

/**
 * @typedef {Object} RecruiteeApiResponse
 * @property {RecruiteeApiJob[]} offers - Array of job offers
 */

import { Provider, Job } from "../utils/models.js";
import { sanitizeHtml } from "../utils/html-sanitizer.js";

const providerId = "recruitee";

const serializeJobs = (jobs = [], hostname, companyTitle, companyId) => {
	return jobs.map((job) => {
		// Combine description and requirements for full job description
		let description = '';
		if (job.description) {
			description = job.description;
		}
		if (job.requirements) {
			description += (description ? ' ' : '') + job.requirements;
		}
		
    // Prefer explicit locations array if available, otherwise fallback to city/country
    const locationsList = Array.isArray(job.locations) && job.locations.length
      ? Array.from(new Set(job.locations.map(l => l?.name).filter(Boolean))).join(', ')
      : `${job.city}, ${job.country}`;

    return new Job({
        id: `${providerId}-${hostname}-${job.id}`,
        name: job.title,
        description: description ? sanitizeHtml(description) : undefined,
        url: job.careers_url,
        publishedDate: job.created_at,
        location: locationsList,
        providerId,
        providerHostname: hostname,
        companyTitle: companyTitle || hostname,
        companyId: companyId || hostname,
    });
	});
};

const getJobs = async ({ hostname, companyTitle = "", companyId = "" }) => {
	let data;
	const url = `https://${hostname}.recruitee.com/api/offers`;
	const options = {
		method: "GET",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	};

	try {
		data = await fetch(url, options)
			.then((res) => {
				if (res.url === url) {
					return res.json();
				} else {
					return {};
				}
			})
			.then((data) => {
				if (data && data.offers) {
					return data.offers.filter(({ status }) => {
						return status === "published";
					});
				} else {
					return [];
				}
			});
	} catch (error) {
		console.log(`error fetching ${hostname} jobs`, url, error);
	}

	if (data) {
		return serializeJobs(data, hostname, companyTitle, companyId);
	} else {
		return data;
	}
};

const api = new Provider({
	id: providerId,
	getJobs,
});

export default api;
export { getJobs };
