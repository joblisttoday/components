/* workable
	 - https://workable.readme.io/reference/jobs-1
	 - https://www.workable.com/api/accounts/workmotion
	 - https://apply.workable.com/api/v1/widget/accounts/workmotion
 */

import { Provider, Job } from "../utils/models.js";

const providerId = "workable";

const serializeJobs = (jobs = [], hostname, companyTitle, companyId) => {
	return jobs.map((job) => {
		const { id, city, country, url, title, published_on } = job;
		return new Job({
			id: `${providerId}-${hostname}-${id}`,
			name: title,
			url: url,
			publishedDate: published_on,
			location: `${city}, ${country}`,
			companyTitle: companyTitle || hostname,
			companyId: companyId || hostname,
			providerHostname: hostname,
			providerId,
		});
	});
};

const getJobs = async ({ hostname, companyTitle = "", companyId = "" }) => {
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
		if (!data || !data.jobs) {
			throw Error(`Company ${hostname} not found`);
		}
		allJobs = data.jobs;
	} catch (error) {
		console.log(`error fetching company jobs: ${hostname}`, error);
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
