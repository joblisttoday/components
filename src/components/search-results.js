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
				const $message = document.createElement("span");
				$message.textContent = "Search companies and jobs indices with ";
				const $linkFTS = document.createElement("a");
				$linkFTS.setAttribute(
					"href",
					"https://en.wikipedia.org/wiki/Full-text_search",
				);
				$linkFTS.textContent = "full text search syntax";

				const $linkSqlite = document.createElement("a");
				$linkSqlite.setAttribute(
					"href",
					"https://sqlime.org/#https://joblist.gitlab.io/workers/joblist.db",
				);
				$linkSqlite.textContent = "sqlite3 queries";
				noResults.append(
					$message,
					$linkFTS,
					" or directly with ",
					$linkSqlite,
					".",
				);
			} else {
				noResults.textContent = "No results found.";
			}
			this.append(noResults);
			return;
		}

		// Render companies
		if (companies && companies.length) {
			const companyColumns = companies[0].columns;
			for (const companyValues of companies[0].values) {
				const companyEl = document.createElement("joblist-company");
				companyColumns.forEach((column, index) => {
					const value = companyValues[index];
					value && companyEl.setAttribute(column, value);
				});
				this.appendChild(companyEl);
			}
		}

		// Render jobs
		if (jobs && jobs.length) {
			const jobColumns = jobs[0].columns;
			for (const jobValues of jobs[0].values) {
				const jobEl = document.createElement("joblist-job");
				jobColumns.forEach((column, index) => {
					const value = jobValues[index];
					value && jobEl.setAttribute(column, value);
				});
				this.appendChild(jobEl);
			}
		}
	}
}
