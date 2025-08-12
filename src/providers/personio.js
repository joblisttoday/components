/* personio
	 docs:
	 - https://developer.personio.de/docs/retrieving-open-job-positions
	 - https://developer.personio.de/docs/integration-of-open-positions
 */

import { Provider, Job } from "../utils/models.js";
import { sanitizeHtml } from "../utils/html-sanitizer.js";

const providerId = "personio";

const serializeJobs = (jobs = [], hostname, companyTitle, companyId) => {
	const baseUrl = `https://${hostname}.jobs.personio.de`;
	return jobs.map((job) => {
		const { name, id, office, createdAt, description } = job;
		const newJob = new Job({
			id: `${providerId}-${hostname}-${id}`,
			name,
			description: description ? sanitizeHtml(description) : undefined,
			url: `${baseUrl}/job/${id}`,
			publishedDate: createdAt,
			location: office,
			providerId,
			providerHostname: hostname,
			companyTitle: companyTitle || hostname,
			companyId: companyId || hostname,
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

		// Parse job descriptions
		const jobDescriptions = job.getElementsByTagName("jobDescriptions");
		if (jobDescriptions && jobDescriptions[0]) {
			const descriptionElements =
				jobDescriptions[0].getElementsByTagName("jobDescription");
			const descriptions = [];

			for (let i = 0; i < descriptionElements.length; i++) {
				const descElement = descriptionElements[i];
				const valueEl = descElement.getElementsByTagName("value");
				if (valueEl && valueEl[0] && valueEl[0].textContent) {
					descriptions.push(valueEl[0].textContent.trim());
				}
			}

			newJob.description = descriptions.join(" ");
		}

		return newJob;
	});
	return jsonJobs;
};

const getJobs = async ({
	hostname,
	companyId = "",
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

	const jobs = [];
	if (response) {
		return serializeJobs(response, hostname, companyTitle, companyId);
	}
	return jobs;
};

const api = new Provider({
	id: providerId,
	getJobs,
});

export default api;
export { getJobs };
