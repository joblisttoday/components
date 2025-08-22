/**
 * Search results display component for rendering job and company search results.
 * Handles displaying search statistics, empty states, and organized result sections.
 * Automatically updates when results data changes.
 * 
 * @class JoblistSearchResults
 * @extends HTMLElement
 */
export default class JoblistSearchResults extends HTMLElement {
	/**
	 * Specifies which attributes to observe for changes.
	 * 
	 * @static
	 * @returns {string[]} Array of attribute names to observe
	 */
	static get observedAttributes() {
		return ["results"];
	}
	/**
	 * Gets the search results data from the results attribute.
	 * 
	 * @returns {Object} Parsed search results object or empty object if not set
	 */
	get results() {
		const resultsAttr = this.getAttribute("results");
		return resultsAttr ? JSON.parse(resultsAttr) : {};
	}
	/**
	 * Lifecycle callback when component is added to DOM.
	 * Triggers initial rendering of search results.
	 */
	connectedCallback() {
		this._render();
	}

	/**
	 * Lifecycle callback when observed attributes change.
	 * Re-renders the component when results attribute changes.
	 * 
	 * @param {string} name - The name of the changed attribute
	 * @param {string} oldValue - The previous attribute value
	 * @param {string} newValue - The new attribute value
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "results") {
			this._render();
		}
	}

	/**
	 * Renders the search results display.
	 * Shows search statistics, handles empty states, and displays organized
	 * sections for companies and jobs.
	 * 
	 * @private
	 */
	_render() {
		this.textContent = "";
		const { companies, jobs, query, searchType, stats, isHighlightedQuery } =
			this.results;

		console.log("🎨 Rendering search results:", {
			searchType,
			query,
			companiesCount: companies?.length || 0,
			jobsCount: jobs?.length || 0,
			stats,
		});

		// Show search statistics if available
		if (stats && (stats.totalCompanies > 0 || stats.totalJobs > 0)) {
			const statsEl = document.createElement("div");
			statsEl.className = "search-stats";

			let statsText = "";
			if (isHighlightedQuery) {
				// Special messaging for highlighted companies
				if (searchType === "companies") {
					statsText = `Showing ${stats.totalCompanies} highlighted companies`;
				} else if (searchType === "jobs") {
					statsText = `Showing ${stats.totalJobs} jobs from highlighted companies`;
				} else {
					statsText = `Showing ${stats.totalCompanies} highlighted companies and ${stats.totalJobs} jobs from highlighted companies (${stats.total} total results)`;
				}
			} else {
				// Regular search results
				if (searchType === "companies") {
					statsText = `Found ${stats.totalCompanies} company results`;
				} else if (searchType === "jobs") {
					statsText = `Found ${stats.totalJobs} job results`;
				} else {
					statsText = `Found ${stats.totalCompanies} companies and ${stats.totalJobs} jobs (${stats.total} total results)`;
				}

				if (query) {
					statsText += ` for "${query}"`;
				}
			}

			statsEl.textContent = statsText;
			this.append(statsEl);
		}

		// Check if there are no results
		if ((!companies || !companies.length) && (!jobs || !jobs.length)) {
			const noResults = document.createElement("joblist-results-404");
			if (!query && !isHighlightedQuery) {
				noResults.textContent =
					"Input a query to see the matching search results.";
			} else if (isHighlightedQuery) {
				const { searchType } = this.results;
				if (searchType === "jobs") {
					noResults.textContent = "No jobs from highlighted companies found.";
				} else if (searchType === "companies") {
					noResults.textContent = "No highlighted companies found.";
				} else {
					noResults.textContent = "No highlighted companies or jobs found.";
				}
			} else {
				noResults.textContent = "No results found ø.";
			}
			this.append(noResults);
			return;
		}

		// Display companies section
		if (companies && companies.length > 0) {
			const companiesSection = document.createElement("div");
			companiesSection.className = "search-section";

			if (jobs && jobs.length > 0) {
				const companiesHeader = document.createElement("h3");
				companiesHeader.textContent = `Companies (${companies.length})`;
				companiesSection.appendChild(companiesHeader);
			}

			companies.forEach((company) => {
				const companyEl = document.createElement("joblist-company");
				companyEl.setAttribute("company", JSON.stringify(company));
				companiesSection.appendChild(companyEl);
			});

			this.appendChild(companiesSection);
		}

		// Display jobs section
		if (jobs && jobs.length > 0) {
			const jobsSection = document.createElement("div");
			jobsSection.className = "search-section";

			if (companies && companies.length > 0) {
				const jobsHeader = document.createElement("h3");
				jobsHeader.textContent = `Jobs (${jobs.length})`;
				jobsSection.appendChild(jobsHeader);
			}

			jobs.forEach((job) => {
				const jobEl = document.createElement("joblist-job");
				jobEl.setAttribute("job", JSON.stringify(job));
				jobsSection.appendChild(jobEl);
			});

			this.appendChild(jobsSection);
		}
	}
}
