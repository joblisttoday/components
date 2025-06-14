import { generateMissingDates } from "../utils/heatmap.js";
import { Company } from "../utils/models.js";

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
	getStats() {
		return this.fetch(`/sqlite/stats`);
	}
	async getCompanies() {
		const companies = await this.fetch("/sqlite/companies");
		return (
			companies?.map(
				(c) =>
					new Company(c, {
						serializePositions: true,
					}),
			) || []
		);
	}
	async getCompany(id) {
		const res = await this.fetch(`/sqlite/companies/${id}`);
		const data = res[0];
		if (data) {
			return new Company(data);
		}
	}
	getJobs(signal) {
		return this.fetch("/sqlite/jobs");
	}
	getJob(objectId) {
		return this.fetch(`/sqlite/job/${objectId}`);
	}

	async getCompanyHeatmap(id, days = 365, signal) {
		let data;
		try {
			data = await this.fetch(
				`/sqlite/heatmap/${id}`,
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
	getTagsCompanies() {
		return this.fetch("/sqlite/tags/companies");
	}
	getTagCompanies(tag) {
		return this.fetch(`/sqlite/tags/companies/${tag}`);
	}
}

export default new JoblistApiSDK();
