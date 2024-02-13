/* recruitee
	 docs:
	 - https://docs.recruitee.com/reference/offers
	 - https://careers.recruitee.com/docs
 */

import { Provider, Job } from "../utils/models.js";

const providerId = "recruitee";

const serializeJobs = (jobs = [], hostname, companyTitle, companySlug) => {
	return jobs.map((job) => {
		return new Job({
			id: `${providerId}-${hostname}-${job.id}`,
			name: job.title,
			url: job.careers_url,
			publishedDate: job.created_at,
			location: `${job.city}, ${job.country}`,
			providerId,
			providerHostname: hostname,
			companyTitle: companyTitle || hostname,
			companySlug: companySlug || hostname,
		});
	});
};

const getJobs = async ({ hostname, companyTitle = "", companySlug = "" }) => {
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
		return serializeJobs(data, hostname, companyTitle, companySlug);
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
