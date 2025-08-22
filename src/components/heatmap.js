import { JoblistDuckDBSDK } from "../libs/sdk-duckdb.js";
import { JoblistApiSDK } from "../libs/sdk-api.js";
import heatmapCompany from "../plots/heatmap.js";

/**
 * Custom web component for displaying job posting heatmaps
 * @class JoblistHeatmap
 * @extends HTMLElement
 */
export default class JoblistHeatmap extends HTMLElement {
	/**
	 * Observed attributes for the component
	 * @returns {string[]} Array of attribute names to observe
	 */
	static get observedAttributes() {
		return ["company-id", "days", "database-url", "api-url"];
	}

	/**
	 * Gets the company ID for filtering heatmap data
	 * @returns {string} Company ID
	 */
	get companyId() {
		return this.getAttribute("company-id");
	}

	/**
	 * Gets the number of days to include in heatmap
	 * @returns {number} Number of days, defaults to 365
	 */
	get days() {
		return Number(this.getAttribute("days")) || 365;
	}

	/**
	 * Gets the DuckDB database URL
	 * @returns {string} Database URL
	 */
	get databaseUrl() {
		return (
			this.getAttribute("database-url") ||
			"https://workers.joblist.today" // DuckDB parquet base URL (default)
		);
	}

	/**
	 * Gets the API URL
	 * @returns {string} API URL
	 */
	get apiUrl() {
		// Default to API for now; allows working heatmap without explicit attribute
		return this.getAttribute("api-url") || "https://api.joblist.today";
	}

	/**
	 * Constructor to initialize abort controller
	 */
	constructor() {
		super();
		/** @type {AbortController|null} Controller for aborting requests */
		this.abortController = null;
	}

	/**
	 * Called when observed attributes change
	 * @param {string} name - Attribute name
	 * @param {string} oldVal - Old attribute value
	 * @param {string} val - New attribute value
	 */
	attributeChangedCallback(name, oldVal, val) {
		if (this.abortController) {
			this.abortController.abort(); // Abort previous request if exists
		}
		this.init();
	}

	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	async connectedCallback() {
		await this.init();
	}
	
	/**
	 * Scrolls the heatmap to the end (most recent data)
	 */
	scrollToEnd() {
		const $figure = this.querySelector("figure");
		if ($figure) {
			$figure.scrollLeft = $figure.scrollLeftMax;
		} else {
			this.scrollLeft = this.scrollLeftMax;
		}
	}

	/**
	 * Initializes the heatmap by fetching data and rendering
	 */
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

	/**
	 * Renders the heatmap visualization
	 */
	render() {
		if (this.heatmap) {
			// Check if heatmap has any data (any day with total > 0)
			const hasData = this.heatmap.some(day => day.total > 0);
			
			if (hasData) {
				// Remove no-data attribute if it exists
				this.removeAttribute('no-data');
				
				const heatmap = heatmapCompany(this.heatmap, {
					id: this.companyId,
					days: this.days,
				});
				this.replaceChildren(heatmap);
				this.scrollToEnd();
			} else {
				// Set no-data attribute to hide the heatmap
				this.setAttribute('no-data', 'true');
				this.replaceChildren(); // Clear content
			}
		}
	}
}
