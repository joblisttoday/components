import apiSdk from "../libs/sdk-api.js";

export default class JoblistCompanies extends HTMLElement {
	async connectedCallback() {
		const companies = await apiSdk.getCompanies()
		this.render(companies);
	}
	render(companies) {
		const index = this.createIndex(companies)
		index.append(this.createTemplate())
		this.replaceChildren(index);
	}
	createIndex(index) {
		const $index = document.createElement("joblist-aindex");
		$index.setAttribute("index", JSON.stringify(index))
		$index.setAttribute("key", "id")
		return $index
	}
	createTemplate() {
		const template = document.createElement("template")
		template.content.append(document.createElement("joblist-company"))
		template.setAttribute("key", "company")
		return template
	}
}
