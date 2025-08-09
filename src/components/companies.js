import { JoblistDuckDBSDK } from "../libs/sdk-duckdb.js";

export default class JoblistCompanies extends HTMLElement {
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
	render(companies) {
		const index = this.createIndex(companies);
		index.append(this.createTemplate());
		this.replaceChildren(index);
	}
	createIndex(index) {
		const $index = document.createElement("joblist-aindex");
		$index.setAttribute("index", JSON.stringify(index));
		$index.setAttribute("key", "id");
		return $index;
	}
	createTemplate() {
		const template = document.createElement("template");
		const el = document.createElement("joblist-company");
		template.content.appendChild(el);
		template.setAttribute("key", "company");
		return template;
	}
}
