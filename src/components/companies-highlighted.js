import joblistDuckDBSDK, { JoblistDuckDBSDK } from "../libs/sdk-duckdb.js";

/**
 * Custom web component for displaying highlighted companies from DuckDB data
 * @class JoblistCompaniesHighlighted
 * @extends HTMLElement
 */
export default class JoblistCompaniesHighlighted extends HTMLElement {
	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	async connectedCallback() {
        // Allow override per element
        const base = this.getAttribute("parquet-base") || undefined;
        const mode = this.getAttribute("parquet-mode") || "buffer";
        this.sdk = base || mode ? new JoblistDuckDBSDK(base, { mode }) : joblistDuckDBSDK;
		await this.sdk.initialize();
		try {
			const companies = await this.sdk.getCompaniesHighlighted();
			if (companies.length) {
				this.render(companies);
			} else {
				this.renderNoCompanies();
			}
		} catch (error) {
			this.textContent = "Error loading companies";
		}
	}
	/**
	 * Renders the list of highlighted companies
	 * @param {Array} companies - Array of company objects to render
	 */
	render(companies) {
		const list = document.createElement("ul");
		const listItems = companies.map((company) => {
			const listItem = document.createElement("li");
			listItem.replaceChildren(this.createCompany(company));
			return listItem;
		});
		list.replaceChildren(...listItems);
		this.replaceChildren(list);
	}
	/**
	 * Renders empty state when no companies are available
	 */
	renderNoCompanies() {}
	/**
	 * Creates a company component element
	 * @param {Object} company - Company data object
	 * @returns {HTMLElement} Company component element
	 */
	createCompany(company) {
		const dom = document.createElement("joblist-company");
		dom.setAttribute("company", JSON.stringify(company));
		return dom;
	}
}
