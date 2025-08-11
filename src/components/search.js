import { JoblistDuckDBSDK } from "../libs/sdk-duckdb.js";

export default class JoblistSearch extends HTMLElement {
	get placeholder() {
		return this.getAttribute("placeholder");
	}
	get databaseUrl() {
		return (
			this.getAttribute("database-url") ||
			"https://workers.joblist.today"
		);
	}
	get query() {
		return this.getAttribute("query");
	}

	get searchType() {
		return this.getAttribute("search-type") || "both"; // "companies", "jobs", or "both"
	}

	async search(query = "", searchType = null) {
		const activeSearchType = searchType || this.searchType;
		let companies = [], jobs = [];
		let isHighlightedQuery = false;
		
		console.log(`🔎 SEARCH DEBUG: query="${query}", requestedType="${searchType}", activeType="${activeSearchType}"`);
		console.log(`🔎 SEARCH DEBUG: this.searchType="${this.searchType}", attribute="${this.getAttribute('search-type')}"`);
		
		try {
			if (activeSearchType === "companies" || activeSearchType === "both") {
				console.log("🏢 WILL search companies");
				if (!query || query.trim() === "") {
					// Show highlighted companies when no search query
					companies = await this.joblistSDK.getCompaniesHighlighted();
					isHighlightedQuery = true;
					console.log("🏢 FOUND highlighted companies:", companies.length);
				} else {
					companies = await this.joblistSDK.searchCompanies(query);
					console.log("🏢 FOUND companies:", companies.length);
				}
			} else {
				console.log("🏢 SKIPPING companies search");
			}
			
			if (activeSearchType === "jobs" || activeSearchType === "both") {
				console.log("💼 WILL search jobs");
				if (!query || query.trim() === "") {
					// Show jobs from highlighted companies when no search query
					if (isHighlightedQuery || activeSearchType === "jobs") {
						jobs = await this.joblistSDK.getJobsFromHighlightedCompanies();
						console.log("💼 FOUND jobs from highlighted companies:", jobs.length);
					}
				} else {
					jobs = await this.joblistSDK.searchJobs(query);
					console.log("💼 FOUND jobs:", jobs.length);
				}
				console.log("💼 Jobs sample:", jobs.slice(0, 1));
			} else {
				console.log("💼 SKIPPING jobs search");
			}
		} catch (e) {
			console.error("❌ Search error:", e);
		}

		const result = { 
			jobs, 
			companies, 
			query, 
			searchType: activeSearchType,
			isHighlightedQuery,
			stats: {
				totalCompanies: companies.length,
				totalJobs: jobs.length,
				total: companies.length + jobs.length
			}
		};
		
		console.log("📊 FINAL RESULT:", {
			companiesCount: result.companies.length,
			jobsCount: result.jobs.length,
			searchType: result.searchType,
			query: result.query
		});
		
		const resultEvent = new CustomEvent("search", {
			bubbles: false,
			detail: result,
		});
		this.dispatchEvent(resultEvent);
		return result;
	}

	constructor() {
		super();
		this.debounceTimeout = null;
		this.debouncingDelay = 333;
	}

	async connectedCallback() {
		this.joblistSDK = new JoblistDuckDBSDK(this.databaseUrl);
		await this.joblistSDK.initialize();
		if (this.query) {
			this.search(this.query);
		} else {
			// Load highlighted companies by default when no query
			this.search("");
		}
		this._render(this.query);
	}
	_render(query = "") {
		const container = document.createElement("div");
		container.className = "search-container";
		
		// Search input
		const $input = document.createElement("input");
		$input.type = "search";
		$input.placeholder = this.placeholder || "Search companies and jobs";
		$input.addEventListener("input", this._debounceOnInput.bind(this));
		if (query) {
			$input.value = query;
		}
		
		// Filter options
		const filterContainer = document.createElement("div");
		filterContainer.className = "search-filters";
		
		// Radio buttons for search type
		const filters = [
			{ value: "both", label: "Companies & Jobs", default: true },
			{ value: "companies", label: "Companies only" },
			{ value: "jobs", label: "Jobs only" }
		];
		
		filters.forEach(filter => {
			const label = document.createElement("label");
			label.className = "search-filter-option";
			
			const radio = document.createElement("input");
			radio.type = "radio";
			radio.name = "search-type";
			radio.value = filter.value;
			radio.checked = filter.value === this.searchType;
			radio.addEventListener("change", this._onFilterChange.bind(this));
			
			const span = document.createElement("span");
			span.textContent = filter.label;
			
			label.appendChild(radio);
			label.appendChild(span);
			filterContainer.appendChild(label);
		});
		
		container.appendChild($input);
		container.appendChild(filterContainer);
		
		// Add some basic styling
		const style = document.createElement("style");
		style.textContent = `
			.search-container {
				display: flex;
				flex-direction: column;
				gap: 0.5rem;
			}
			.search-filters {
				display: flex;
				gap: 1rem;
				align-items: center;
				font-size: 0.9rem;
			}
			.search-filter-option {
				display: flex;
				align-items: center;
				gap: 0.25rem;
				cursor: pointer;
			}
			.search-filter-option input[type="radio"] {
				margin: 0;
			}
		`;
		
		this.replaceChildren(style, container);
	}

	_debounceOnInput(event) {
		if (this.debounceTimeout) {
			clearTimeout(this.debounceTimeout);
		}
		this.debounceTimeout = setTimeout(
			() => this._onInput(event),
			this.debouncingDelay,
		);
	}

	async _onInput(event) {
		const { value: query } = event.target;
		this.search(query);
	}

	async _onFilterChange(event) {
		const newSearchType = event.target.value;
		this.setAttribute("search-type", newSearchType);
		
		// Re-run search with current query if there is one
		const input = this.querySelector('input[type="search"]');
		if (input && input.value.trim()) {
			this.search(input.value, newSearchType);
		}
	}

	async _onCoordinatesInput(event = { target: { value: {} } }) {
		const { value } = event.target;
		const { lat = 52.52, lon = 13.405, radius = 0.1 } = value;
		let companies, jobs;
		try {
			companies = await this.joblistSDK.searchCompaniesByCoordinates(
				lat,
				lon,
				radius,
			);

			/* @TODO jobs do not have positions in providers */
			/* jobs = await sdk.searchJobsByCoordinates(lat, lon, radius); */
		} catch (e) {
			console.info("Search error.", e);
		}
		const result = { jobs, companies };
		const resultEvent = new CustomEvent("search", {
			bubbles: false,
			detail: result,
		});
		this.dispatchEvent(resultEvent);
		return result;
	}
}
