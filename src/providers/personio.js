/* personio
	 docs:
	 - https://developer.personio.de/docs/retrieving-open-job-positions
	 - https://developer.personio.de/docs/integration-of-open-positions
 */

import { Provider, Job } from "../utils/models.js";

const providerId = "personio";

const serializeJobs = (jobs = [], hostname, companyTitle, companySlug) => {
	const baseUrl = `https://${hostname}.jobs.personio.de`;
	return jobs.map((job) => {
		const { name, id, office, createdAt } = job;
		const newJob = new Job({
			id: `${providerId}-${hostname}-${id}`,
			name,
			url: `${baseUrl}/job/${id}`,
			publishedDate: createdAt,
			location: office,
			providerId,
			providerHostname: hostname,
			companyTitle: companyTitle || hostname,
			companySlug: companySlug || hostname,
		});
		/* some jobs can have no location (office), algolia bugs if the key is missing  */
		if (!newJob.location) {
			delete newJob.location;
		}
		return newJob;
	});
};

const parseResXml = (textRes) => {
	const params = [
		"id",
		"name",
		"occupationCategory",
		"employmentType",
		"office",
		"createdAt",
	];
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(textRes, "text/xml");

	const xmlJobs = xmlDoc.getElementsByTagName("workzag-jobs")[0];
	const positions = xmlDoc.getElementsByTagName("position");

	const jsonJobs = Object.entries(positions).map((item) => {
		const job = item[1];
		const newJob = {};
		const setParam = (param) => {
			let el;
			try {
				el = job.getElementsByTagName(param);
			} catch (error) {}
			if (el && el[0]) {
				newJob[param] = el[0].childNodes[0].nodeValue;
			}
		};
		params.forEach(setParam);
		return newJob;
	});
	return jsonJobs;
};

const getJobs = async ({
	hostname,
	companySlug = "",
	companyTitle = "",
	language = "en",
}) => {
	const baseUrl = `https://${hostname}.jobs.personio.de`;
	const providerUrl = `${baseUrl}/xml?language=${language}`;

	let response;
	try {
		response = await fetch(providerUrl)
			.then((res) => {
				if (res.status >= 200 && res.status < 300) {
					return res.text();
				}
			})
			.then((data) => {
				return parseResXml(data);
			});
	} catch (error) {
		console.log("Error", error, providerUrl);
	}

	let jobs = [];
	if (jobs) {
		return serializeJobs(response, hostname, companyTitle, companySlug);
	}
	return jobs;
};

const api = new Provider({
	id: providerId,
	getJobs,
});

export default api;
export { getJobs };
