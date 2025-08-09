import joblistDuckDBSDK, { JoblistDuckDBSDK } from "../libs/sdk-duckdb.js";

export default class JoblistCompaniesHighlighted extends HTMLElement {
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
	renderNoCompanies() {}
	createCompany(company) {
		const dom = document.createElement("joblist-company");
		dom.setAttribute("company", JSON.stringify(company));
		return dom;
	}
}
