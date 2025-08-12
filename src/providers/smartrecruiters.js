/* smartrecruiters
	 docs:
	 - https://dev.smartrecruiters.com/customer-api/posting-api/endpoints/postings/
	 - https://jobs.smartrecruiters.com/sr-jobs/company-lookup?q=a
	 - https://api.smartrecruiters.com/v1/companies/Mitie/postings
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
