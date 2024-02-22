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
			this.append(this.createNoResults(query));
			return;
		}

		// Render companies
		if (companies && companies.length) {
			this.append(...this.createCompanies(companies));
		}

		// Render jobs
		if (jobs && jobs.length) {
			this.append(...this.createJonbs);
		}
	}
	createNoResults(query) {
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
		return noResults;
	}
	createCompanies(companies) {
		return companies.map((company) => {
			const companyEl = document.createElement("joblist-company");
			Object.entries(company).forEach(([key, val]) => {
				val && companyEl.setAttribute(key, val);
			});
			return companyEl;
		});
	}
	createJobs(jobs) {
		return jobs.map((job) => {
			const jobEl = document.createElement("joblist-job");
			Object.entries(job).forEach(([key, val]) => {
				val && jobEl.setAttribute(key, val);
			});
			return jobEl;
		});
	}
}
