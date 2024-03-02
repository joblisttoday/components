export default class JoblistSearchResults extends HTMLElement {
	static get observedAttributes() {
		return ["results"];
	}
	get results() {
		const resultsAttr = this.getAttribute("results");
		return resultsAttr ? JSON.parse(resultsAttr) : {};
	}
	connectedCallback() {
		this._render();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "results") {
			this._render();
		}
	}

	_render() {
		this.textContent = "";
		const { companies, jobs, query } = this.results;

		// Check if there are no results
		if ((!companies || !companies.length) && (!jobs || !jobs.length)) {
			const noResults = document.createElement("joblist-results-404");
			if (!query) {
				noResults.textContent = "Input a search query.";
			} else {
				noResults.textContent = "No results found ø.";
			}
			this.append(noResults);
			return;
		}

		companies?.forEach((company) => {
			const companyEl = document.createElement("joblist-company");
			companyEl.setAttribute("company", JSON.stringify(company));
			this.appendChild(companyEl);
		});

		jobs?.forEach((job) => {
			const jobEl = document.createElement("joblist-job");
			jobEl.setAttribute("job", JSON.stringify(job));
			this.appendChild(jobEl);
		});
	}
}
