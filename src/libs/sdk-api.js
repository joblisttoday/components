import { generateMissingDates } from "../utils/heatmap.js";

export class JoblistApiSDK {
	constructor(url = "https://api.joblist.today") {
		this.url = url;
	}

	fetch(endpoint = "", params = [], signal = new AbortController()) {
		let url = this.url;
		url += endpoint;
		if (params) {
			const sp = new URLSearchParams(Object.fromEntries(params));
			url += `?${sp.toString()}`;
		}
		return fetch(`${url}`, { signal }).then((res) => res.json());
	}

	getAllCompaniesData(signal) {
		return this.fetch("/sqlite/companies", [], signal);
	}

	async getAllJobsData(signal) {
		return this.fetch("/sqlite/jobs", [], signal);
	}

	async getCompanyHeatmap(slug, days = 365, signal) {
		let data;
		try {
			data = await this.fetch(
				`/sqlite/heatmap/${slug}`,
				[["days", days]],
				signal,
			);
		} catch (e) {
			data = [];
		}
		return generateMissingDates(data, days);
		/* if (!signal?.aborted) {
			 } */
	}

	async getJobsHeatmap(days = 365, signal) {
		let data;
		try {
			data = await this.fetch("/sqlite/heatmap", [["days", days]], signal);
		} catch (e) {
			data = [];
		}
		if (!signal?.aborted) {
			return generateMissingDates(data, days);
		}
	}
}

export default new JoblistApiSDK();
