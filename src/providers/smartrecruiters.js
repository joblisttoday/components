/* smartrecruiters
	 docs:
	 - https://dev.smartrecruiters.com/customer-api/posting-api/endpoints/postings/
	 - https://jobs.smartrecruiters.com/sr-jobs/company-lookup?q=a
	 - https://api.smartrecruiters.com/v1/companies/Mitie/postings
 */

import { Provider, Job } from "../utils/models.js";

const providerId = "smartrecruiters";
const baseUrl = "https://api.smartrecruiters.com/v1/companies";
const jobPostingBaseUrl = `https://jobs.smartrecruiters.com`;

const serializeJobs = (jobs = [], hostname, companyTitle, companySlug) => {
	return jobs.map((job) => {
		return new Job({
			id: `${providerId}-${hostname}-${job.uuid}`,
			name: job.name,
			url: `${jobPostingBaseUrl}/${hostname}/${job.id}`,
			publishedDate: job.releasedDate,
			location: `${job.location.city}, ${job.location.country}`,
			providerId,
			providerHostname: hostname,
			companyTitle: companyTitle || hostname,
			companySlug: companySlug || hostname,
		});
	});
};

const getJobs = async ({
	hostname,
	companyTitle = "",
	companySlug = "",
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
		return serializeJobs(jobs, hostname, companyTitle, companySlug);
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
