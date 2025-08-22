import { JoblistDuckDBSDK } from "../libs/sdk-duckdb.js";

/**
 * Custom web component for displaying companies in an alphabetical index
 * @class JoblistCompanies
 * @extends HTMLElement
 */
export default class JoblistCompanies extends HTMLElement {
	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	async connectedCallback() {
        const base = this.getAttribute("parquet-base") || undefined;
        const mode = this.getAttribute("parquet-mode") || "buffer";
        this.sdk = new JoblistDuckDBSDK(base, { mode });
		const db = await this.sdk.initialize();
		console.log(db);

		const companies = await this.sdk.getCompanies();
		this.render(companies);
		try {
		} catch (error) {
			this.textContent = "Error loading companies";
		}
	}
	/**
	 * Renders companies in an alphabetical index
	 * @param {Array} companies - Array of company objects to render
	 */
	render(companies) {
		const index = this.createIndex(companies);
		index.append(this.createTemplate());
		this.replaceChildren(index);
	}
	/**
	 * Creates alphabetical index component
	 * @param {Array} index - Array of companies for indexing
	 * @returns {HTMLElement} Alphabetical index element
	 */
	createIndex(index) {
		const $index = document.createElement("joblist-aindex");
		$index.setAttribute("index", JSON.stringify(index));
		$index.setAttribute("key", "id");
		return $index;
	}
	/**
	 * Creates template element for company rendering
	 * @returns {HTMLTemplateElement} Template element for companies
	 */
	createTemplate() {
		const template = document.createElement("template");
		const el = document.createElement("joblist-company");
		template.content.appendChild(el);
		template.setAttribute("key", "company");
		return template;
	}
}
