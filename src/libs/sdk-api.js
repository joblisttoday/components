import { generateMissingDates } from "../utils/heatmap.js";

export class JoblistApiSDK {
	constructor(url = "https://api.joblist.today") {
		this.url = url;
	}
	fetch(endpoint = "", params = [], signal) {
		let url = this.url;
		url += endpoint;
		if (params && params.length) {
			const sp = new URLSearchParams(Object.fromEntries(params));
			url += `?${sp.toString()}`;
		}
		const config = {};
		if (signal) {
			config.signal = signal;
		}
		return fetch(`${url}`, config).then((res) => res.json());
	}
	getCompanies() {
		return this.fetch("/sqlite/companies");
	}
	async getCompany(slug) {
		const res = await this.fetch(`/sqlite/companies/${slug}`);
		const data = res[0];
		if (data) {
			return {
				...data,
				tags: JSON.parse(data?.tags || []),
				positions: JSON.parse(data?.positions || []),
			};
		}
	}
	getJobs(signal) {
		return this.fetch("/sqlite/jobs");
	}
	getJob(objectId) {
		return this.fetch(`/sqlite/job/${objectId}`);
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
