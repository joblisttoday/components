/**
 * @fileoverview Greenhouse job board API integration
 * @see {@link https://developers.greenhouse.io/job-board.html}
 */

/**
 * @typedef {Object} JobLocation
 * @property {string} name - Location name
 */

/**
 * @typedef {Object} JobOffice  
 * @property {string} name - Office name
 * @property {string} location - Office location
 */

/**
 * @typedef {Object} DataCompliance
 * @property {string} type - Compliance type (e.g., "gdpr")
 * @property {boolean} requires_consent - Whether consent is required
 * @property {boolean} requires_processing_consent - Whether processing consent is required
 * @property {boolean} requires_retention_consent - Whether retention consent is required
 * @property {string|null} retention_period - Data retention period
 * @property {boolean} demographic_data_consent_applies - Whether demographic consent applies
 */

/**
 * @typedef {Object} JobMetadata
 * @property {number} id - Metadata field ID
 * @property {string} name - Metadata field name
 * @property {string} value - Metadata field value
 * @property {string} value_type - Type of metadata value
 */

/**
 * @typedef {Object} Department
 * @property {number} id - Department ID
 * @property {string} name - Department name
 * @property {number[]} child_ids - Array of child department IDs
 */

/**
 * @typedef {Object} GreenhouseApiJob
 * @property {number} id - Greenhouse job ID
 * @property {string} title - Job title
 * @property {string} content - Job description (HTML format) - only when ?content=true
 * @property {string} absolute_url - Full URL to job posting
 * @property {string} updated_at - ISO timestamp of last update
 * @property {JobLocation} location - Primary job location
 * @property {JobOffice[]} [offices] - List of office locations
 * @property {DataCompliance[]} data_compliance - Array of compliance requirements
 * @property {number} internal_job_id - Internal Greenhouse job ID
 * @property {JobMetadata[]} metadata - Array of job metadata
 * @property {string} requisition_id - Job requisition ID
 * @property {string} company_name - Company name
 * @property {string} first_published - ISO timestamp when first published
 * @property {Department[]} departments - Array of departments
 */

/**
 * @typedef {Object} GreenhouseApiResponse
 * @property {GreenhouseApiJob[]} jobs - Array of job postings
 */

import { Provider, Job } from "../utils/models.js";


const providerId = "greenhouse";

const getLocation = ({ location } = {}) => {
	const locationName = location?.name || "";
	return locationName || "";
};

const serializeJobs = (jobs = [], hostname, companyTitle, companyId) => {
	return jobs.map((job) => {
		const description = job.content;
    return new Job({
        id: job.id,
        name: job.title,
        description,
        url: job.absolute_url,
        // Prefer first published date if available, else fall back to last update
        publishedDate: job.first_published || job.updated_at,
        location: getLocation(job),
        department: job.departments?.[0]?.name,
        companyTitle: companyTitle || hostname,
        companyId: companyId || hostname,
        providerHostname: hostname,
        providerId,
		});
	});
};

const getJobs = async ({
	hostname,
	companyTitle = "",
	companyId = "",
	city,
	country,
}) => {
	let allJobs = null;
	const url = `https://boards-api.greenhouse.io/v1/boards/${hostname}/jobs?content=true`;

	try {
		allJobs = await fetch(url)
			.then((res) => res.json())
			.then((data) => {
				let search = "";
				if (city) {
					search = city;
				} else if (country) {
					search = country;
				}

				if (!data.jobs) {
					return [];
				}

				if (!search) {
					return data.jobs;
				} else {
					search = search.toLowerCase();

					return data.jobs.filter((item) => {
						const s = item.offices
							.map((office) => {
								return `${office.name} ${office.location}`.toLowerCase();
							})
							.join(" ");
						return s.indexOf(search) > -1;
					});
				}
			});
	} catch (error) {
		console.log("error fetching jobs", error);
	}

	if (allJobs) {
		return serializeJobs(allJobs, hostname, companyTitle, companyId);
	} else {
		return;
	}
};

const api = new Provider({
	id: providerId,
	getJobs,
});

export default api;
export { getJobs };
