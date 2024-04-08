/* lever
	 - https://partnerexperience.lever.co/hc/en-us/articles/5136514106253
 */

import { Provider, Job } from "../utils/models.js";

const providerId = "lever";

const serializeJobs = (jobs = [], hostname, companyTitle, companyId) => {
	return jobs.map((job) => {
		const {
			id,
			text,
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
