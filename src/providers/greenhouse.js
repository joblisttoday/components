/* greenhouse
	 docs:
	 - https://developers.greenhouse.io/job-board.html
 */

import { Provider, Job } from "../utils/models.js";

const providerId = "greenhouse";

const getLocation = ({ location, offices }) => {
	const { name: locationName } = location;
	return locationName || "";
};

const serializeJobs = (jobs = [], hostname, companyTitle, companySlug) => {
	return jobs.map((job) => {
		return new Job({
			id: `${providerId}-${hostname}-${job.id}`,
			name: job.title,
			url: job.absolute_url,
			publishedDate: job.updated_at,
			location: getLocation(job),
			companyTitle: companyTitle || hostname,
			companySlug: companySlug || hostname,
			providerHostname: hostname,
			providerId,
		});
	});
};

const getJobs = async ({
	hostname,
	companyTitle = "",
	companySlug = "",
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
		return serializeJobs(allJobs, hostname, companyTitle, companySlug);
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
