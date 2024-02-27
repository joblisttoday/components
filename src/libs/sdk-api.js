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
		return fetch(`${url}`, { signal })
			.then((res) => res.json())
			.catch((error) => {
				if (error.name === "AbortError") {
					console.log("Fetch aborted");
				} else {
					throw error;
				}
			});
	}

	getAllCompaniesData(signal) {
		return this.fetch("/sqlite/companies", [], signal);
	}

	async getAllJobsData(signal) {
		return this.fetch("/sqlite/jobs", [], signal);
	}

	async getCompanyHeatmap(slug, days = 365, signal) {
		try {
			const data = await this.fetch(
				`/sqlite/heatmap/${slug}`,
				[["days", days]],
				signal,
			);
			if (!signal?.aborted) {
				return generateMissingDates(data, days);
			}
		} catch (e) {
			return e;
		}
	}

	async getJobsHeatmap(days = 365, signal) {
		try {
			const data = await this.fetch(
				"/sqlite/heatmap",
				[["days", days]],
				signal,
			);
			if (!signal?.aborted) {
				return generateMissingDates(data, days);
			}
		} catch (e) {
			return e;
		}
	}
}

export default new JoblistApiSDK();
