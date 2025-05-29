import { JoblistSqlHttpvfsSDK } from "../libs/sdk-sql-httpvfs.js";
import { getAllCompaniesTags } from "../utils/tags.js";

export default class JoblistTags extends HTMLElement {
	async connectedCallback() {
		this.sdk = new JoblistSqlHttpvfsSDK(this.databaseUrl);
		await this.sdk.initialize();
		try {
			const companies = await this.sdk.getCompanies();
			const tags = getAllCompaniesTags(companies);
			this.render(tags);
		} catch (error) {
			this.textContent = "Error loading tags";
		}
	}
	render(tags) {
		const index = this.createIndex(tags);
		index.append(this.createTemplate());
		this.replaceChildren(index);
	}
	createIndex(index) {
		const $index = document.createElement("joblist-aindex");
		$index.setAttribute("index", JSON.stringify(index));
		return $index;
	}
	createTemplate() {
		const template = document.createElement("template");
		template.content.append(document.createElement("joblist-tag"));
		template.setAttribute("key", "tag");
		return template;
	}
}
