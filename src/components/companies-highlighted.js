import joblistSqlHttpvfsSDK from "../libs/sdk-sql-httpvfs.js";

export default class JoblistCompaniesHighlighted extends HTMLElement {
	async connectedCallback() {
		this.sdk = joblistSqlHttpvfsSDK;
		await this.sdk.initialize();
		try {
			const companies = await this.sdk.getCompaniesHighlighted();
			this.render(companies);
		} catch (error) {
			this.textContent = "Error loading companies";
		}
	}
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
	createCompany(company) {
		const dom = document.createElement("joblist-company");
		dom.setAttribute("company", JSON.stringify(company));
		return dom;
	}
}
