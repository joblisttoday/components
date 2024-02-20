import { JoblistSDK } from "../libs/sdk.js";
import heatmapCompany from "../plots/heatmap.js";

export default class JoblistHeatmap extends HTMLElement {
	get slug() {
		return this.getAttribute("slug");
	}
	get days() {
		return Number(this.getAttribute("days")) || 365;
	}
	get databaseUrl() {
		return (
			this.getAttribute("database-url") ||
			`https://joblist.gitlab.io/workers/joblist.db`
		);
	}
	async connectedCallback() {
		this.joblistSDK = new JoblistSDK(this.databaseUrl);
		await this.joblistSDK.initialize();
		if (this.slug) {
			this.heatmap = await this.joblistSDK.getCompanyHeatmap(
				this.slug,
				this.days,
			);
		} else {
			this.heatmap = await this.joblistSDK.getJobsHeatmap(this.days);
		}
		this.render();
	}
	render() {
		if (this.heatmap) {
			const heatmap = heatmapCompany(this.heatmap);
			this.replaceChildren(heatmap);
		}
	}
}
