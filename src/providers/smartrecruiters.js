/**
 * @fileoverview SmartRecruiters API integration
 * @see {@link https://dev.smartrecruiters.com/customer-api/posting-api/endpoints/postings/}
 */

/**
 * @typedef {Object} SmartRecruitersJobLocation
 * @property {string} city - City name
 * @property {string} region - Region code
 * @property {string} country - Country code
 * @property {boolean} remote - Whether job is remote
 * @property {string} latitude - Location latitude
 * @property {string} longitude - Location longitude
 * @property {string} fullLocation - Full formatted location string
 */

/**
 * @typedef {Object} SmartRecruitersCompany
 * @property {string} identifier - Company identifier
 * @property {string} name - Company name
 */

/**
 * @typedef {Object} SmartRecruitersIndustry
 * @property {string} id - Industry ID
 * @property {string} label - Industry label
 */

/**
 * @typedef {Object} SmartRecruitersCustomField
 * @property {string} fieldId - Custom field ID
 * @property {string} fieldLabel - Custom field label
 * @property {string} valueId - Field value ID
 * @property {string} valueLabel - Field value label
 */

/**
 * @typedef {Object} SmartRecruitersCreator
 * @property {string} name - Creator name
 * @property {string} avatarUrl - Creator avatar URL
 */

/**
 * @typedef {Object} SmartRecruitersJobAdSection
 * @property {string} title - Section title
 * @property {string} text - Section HTML content
 */

/**
 * @typedef {Object} SmartRecruitersJobAd
 * @property {Object} sections - Job ad content sections
 * @property {SmartRecruitersJobAdSection} [sections.companyDescription] - Company description section
 * @property {SmartRecruitersJobAdSection} [sections.jobDescription] - Main job description
 * @property {SmartRecruitersJobAdSection} [sections.qualifications] - Job requirements
 * @property {SmartRecruitersJobAdSection} [sections.additionalInformation] - Additional details
 */

/**
 * @typedef {Object} SmartRecruitersApiJob
 * @property {string} id - SmartRecruiters job ID
 * @property {string} name - Job title
 * @property {string} uuid - SmartRecruiters job UUID (different from ID)
 * @property {string} [jobId] - Alternative job ID
 * @property {string} jobAdId - Job advertisement ID
 * @property {boolean} defaultJobAd - Whether this is the default job ad
 * @property {string} refNumber - Reference number
 * @property {SmartRecruitersCompany} company - Company information
 * @property {SmartRecruitersJobLocation} location - Job location
 * @property {SmartRecruitersIndustry} industry - Industry classification
 * @property {SmartRecruitersCustomField[]} customField - Array of custom fields
 * @property {string} releasedDate - ISO timestamp of publication
 * @property {SmartRecruitersCreator} creator - Job creator information
 */

/**
 * @typedef {Object} SmartRecruitersJobDetails
 * @property {SmartRecruitersJobAd} [jobAd] - Detailed job advertisement content
 */

/**
 * @typedef {Object} SmartRecruitersListResponse
 * @property {number} offset - Response offset
 * @property {number} limit - Response limit
 * @property {number} totalFound - Total number of jobs found
 * @property {SmartRecruitersApiJob[]} content - Array of job postings
 */

import { Provider, Job } from "../utils/models.js";
import { sanitizeHtml } from "../utils/html-sanitizer.js";

const providerId = "smartrecruiters";
const baseUrl = "https://api.smartrecruiters.com/v1/companies";
const jobPostingBaseUrl = `https://jobs.smartrecruiters.com`;

const serializeJobs = (jobs = [], hostname, companyTitle, companyId) => {
	return jobs.map((job) => {
		return new Job({
			id: `${providerId}-${hostname}-${job.uuid}`,
			name: job.name,
			description: job.description ? sanitizeHtml(job.description) : undefined,
			url: `${jobPostingBaseUrl}/${hostname}/${job.id}`,
			publishedDate: job.releasedDate,
			location: `${job.location.city}, ${job.location.country}`,
			providerId,
			providerHostname: hostname,
			companyTitle: companyTitle || hostname,
			companyId: companyId || hostname,
		});
	});
};

const getJobDescription = async (hostname, postingId) => {
	const url = `${baseUrl}/${hostname}/postings/${postingId}`;
	try {
		const response = await fetch(url);
		const data = await response.json();
		
		const jobAd = data.jobAd?.sections;
		if (!jobAd) return "";
		
		const sections = [
			jobAd.jobDescription?.text,
			jobAd.qualifications?.text,
			jobAd.additionalInformation?.text,
		].filter(Boolean);
		
		return sections.join(' ');
	} catch (error) {
		console.log(`error fetching job description for ${postingId}:`, error);
		return "";
	}
};

const getJobs = async ({
	hostname,
	companyTitle = "",
	companyId = "",
	city,
}) => {
	let url = `${baseUrl}/${hostname}/postings`;

	/* wants city with fist letter upercase */
	if (city) {
		const cityUpp = city.charAt(0).toUpperCase() + city.slice(1);
		url = url + `?city=${cityUpp}`;
	}

	let jobs = null;
	try {
		await fetch(url)
			.then((res) => {
				return res.json();
			})
			.then((data) => {
				jobs = data.content;
			});
	} catch (error) {
		console.log(`error fetching company jobs: ${hostname}`, error);
	}

	if (jobs) {
		// Fetch job descriptions for all jobs
		const jobsWithDescriptions = await Promise.all(
			jobs.map(async (job) => {
				const description = await getJobDescription(hostname, job.id);
				return { ...job, description };
			})
		);
		
		return serializeJobs(jobsWithDescriptions, hostname, companyTitle, companyId);
	} else {
		return [];
	}
};

const api = new Provider({
	id: providerId,
	getJobs,
});

export default api;
export { getJobs };
