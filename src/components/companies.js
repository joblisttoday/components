import { JoblistSqlHttpvfsSDK } from "../libs/sdk-sql-httpvfs.js";

export default class JoblistCompanies extends HTMLElement {
	async connectedCallback() {
		this.sdk = new JoblistSqlHttpvfsSDK();
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
		template.content.append(document.createElement("joblist-company"));
		template.setAttribute("key", "company");
		return template;
	}
}
