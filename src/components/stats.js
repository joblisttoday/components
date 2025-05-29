import { JoblistSqlHttpvfsSDK } from "../libs/sdk-sql-httpvfs.js";

export default class JoblistStats extends HTMLElement {
	async connectedCallback() {
		this.sdk = new JoblistSqlHttpvfsSDK(this.databaseUrl);
		await this.sdk.initialize();
		try {
			const stats = await this.sdk.getStats();
			this.render(stats);
		} catch (error) {
			this.textContent = "Error loading stats";
		}
	}

	render(stats) {
		const companiesText = document.createElement("p");
		companiesText.textContent = `${stats.total_companies} companies.`;

		const jobsText = document.createElement("p");
		jobsText.textContent = `${stats.total_jobs} jobs.`;
		this.append(companiesText, jobsText);
	}
}
