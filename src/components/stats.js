import { JoblistDuckDBSDK } from "../libs/sdk-duckdb.js";

/**
 * Statistics display component that shows job and company counts.
 * Connects to DuckDB to fetch and display database statistics.
 * 
 * @class JoblistStats
 * @extends HTMLElement
 */
export default class JoblistStats extends HTMLElement {
	/**
	 * Lifecycle callback when component is added to DOM.
	 * Initializes the DuckDB SDK and fetches statistics data.
	 * 
	 *
	 */
	async connectedCallback() {
		const baseParquetUrl = this.getAttribute("parquet-base") || undefined;
		this.sdk = new JoblistDuckDBSDK(baseParquetUrl);
		await this.sdk.initialize();
		try {
			const stats = await this.sdk.getStats();
			this.render(stats);
		} catch (error) {
			this.textContent = "Error loading stats";
		}
	}

	/**
	 * Renders the statistics display.
	 * Shows total company and job counts from the provided stats object.
	 * 
	 * @param {Object} stats - Statistics object containing count data
	 * @param {number} stats.total_companies - Total number of companies
	 * @param {number} stats.total_jobs - Total number of jobs
	 */
	render(stats) {
		const companiesText = document.createElement("p");
		companiesText.textContent = `${stats.total_companies} companies.`;

		const jobsText = document.createElement("p");
		jobsText.textContent = `${stats.total_jobs} jobs.`;
		this.append(companiesText, jobsText);
	}
}
