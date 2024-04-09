import apiSdk from "../libs/sdk-api.js";
import { getAllCompaniesTags } from "../utils/tags.js";

export default class JoblistTags extends HTMLElement {
	async connectedCallback() {
		const companies = await apiSdk.getCompanies()
		const tags= getAllCompaniesTags(companies)
		this.render(tags);
	}
	render(tags) {
		const index = this.createIndex(tags)
		index.append(this.createTemplate())
		this.replaceChildren(index);
	}
	createIndex(index) {
		const $index = document.createElement("joblist-aindex");
		$index.setAttribute("index", JSON.stringify(index))
		return $index
	}
	createTemplate() {
		const template = document.createElement("template")
		template.content.append(document.createElement("joblist-tag"))
		template.setAttribute("key", "tag")
		return template
	}
}
