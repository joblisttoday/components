import joblistDuckDBSDK, { JoblistDuckDBSDK } from "../libs/sdk-duckdb.js";
import { getAllCompaniesTags } from "../utils/tags.js";

/**
 * Tags collection component that displays all available tags from companies.
 * Fetches company data from DuckDB, extracts all tags, and renders them in an indexed format.
 * 
 * @class JoblistTags
 * @extends HTMLElement
 */
export default class JoblistTags extends HTMLElement {
	/**
	 * Lifecycle callback when component is added to DOM.
	 * Initializes DuckDB SDK, fetches companies, extracts tags, and renders them.
	 * 
	 * @async
	 */
	async connectedCallback() {
        const base = this.getAttribute("parquet-base") || undefined;
        const mode = this.getAttribute("parquet-mode") || "buffer";
        this.sdk = base || mode ? new JoblistDuckDBSDK(base, { mode }) : joblistDuckDBSDK;
		await this.sdk.initialize();
		try {
			const companies = await this.sdk.getCompanies();
			const tags = getAllCompaniesTags(companies);
			this.render(tags);
		} catch (error) {
			this.textContent = "Error loading tags";
		}
	}
	/**
	 * Renders the tags collection using an indexed format.
	 * Creates an indexed display with tag templates.
	 * 
	 * @param {Array} tags - Array of tag values to display
	 */
	render(tags) {
		const index = this.createIndex(tags);
		index.append(this.createTemplate());
		this.replaceChildren(index);
	}
	/**
	 * Creates an indexed display element for the tags.
	 * 
	 * @param {Array} index - Array of items to index
	 * @returns {HTMLElement} The indexed display element
	 */
	createIndex(index) {
		const $index = document.createElement("joblist-aindex");
		$index.setAttribute("index", JSON.stringify(index));
		return $index;
	}
	/**
	 * Creates a template element for rendering individual tags.
	 * 
	 * @returns {HTMLTemplateElement} Template with joblist-tag element
	 */
	createTemplate() {
		const template = document.createElement("template");
		template.content.append(document.createElement("joblist-tag"));
		template.setAttribute("key", "tag");
		return template;
	}
}
