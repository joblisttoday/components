import { JoblistDuckDBSDK } from "../libs/sdk-duckdb.js";
import { JoblistApiSDK } from "../libs/sdk-api.js";
import heatmapCompany from "../plots/heatmap.js";

export default class JoblistHeatmap extends HTMLElement {
	static get observedAttributes() {
		return ["company-id", "days", "database-url", "api-url"];
	}

	get companyId() {
		return this.getAttribute("company-id");
	}

	get days() {
		return Number(this.getAttribute("days")) || 365;
	}

	get databaseUrl() {
		return (
			this.getAttribute("database-url") ||
			"https://workers.joblist.today" // DuckDB parquet base URL (default)
		);
	}

	get apiUrl() {
		return this.getAttribute("api-url"); // No default - only use API if explicitly set
	}

	constructor() {
		super();
		this.abortController = null;
	}

	attributeChangedCallback(name, oldVal, val) {
		if (this.abortController) {
			this.abortController.abort(); // Abort previous request if exists
		}
		this.init();
	}

	async connectedCallback() {
		await this.init();
	}
	scrollToEnd() {
		const $figure = this.querySelector("figure");
		if ($figure) {
			$figure.scrollLeft = $figure.scrollLeftMax;
		} else {
			this.scrollLeft = this.scrollLeftMax;
		}
	}

	async init() {
		if (this.days) {
			const controller = new AbortController();
			this.abortController = controller;

			try {
				if (this.apiUrl) {
					this.sdk = new JoblistApiSDK(this.apiUrl);
				} else if (this.databaseUrl) {
					this.sdk = new JoblistDuckDBSDK(this.databaseUrl);
					await this.sdk.initialize();
				}

				if (this.companyId) {
					this.heatmap = await this.sdk.getCompanyHeatmap(
						this.companyId,
						this.days,
						controller.signal,
					);
				} else {
					this.heatmap = await this.sdk.getJobsHeatmap(
						this.days,
						controller.signal,
					);
				}
			} catch (error) {
				if (error.name === "AbortError") {
					console.log("Fetch aborted");
				} else {
					console.error(error);
				}
			}
		}
		this.render();
	}

	render() {
		if (this.heatmap) {
			const heatmap = heatmapCompany(this.heatmap, {
				id: this.companyId,
				days: this.days,
			});
			this.replaceChildren(heatmap);
			this.scrollToEnd();
		}
	}
}
