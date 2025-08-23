import { JoblistDuckDBSDK } from "../libs/sdk-duckdb.js";

/**
 * Search component for querying jobs and companies using DuckDB.
 * Provides a search interface with filtering options and real-time suggestions.
 * Supports searching companies, jobs, or both with debounced input handling.
 * 
 * @class JoblistSearch
 * @extends HTMLElement
 * @event JoblistSearch#search - Emitted when search results are available
 */
export default class JoblistSearch extends HTMLElement {
	/**
	 * Gets the placeholder text for the search input.
	 * 
	 * @returns {string} The placeholder text from the placeholder attribute
	 */
	get placeholder() {
		return this.getAttribute("placeholder");
	}
	/**
	 * Gets the database URL for the DuckDB connection.
	 * 
	 * @returns {string} The database URL from the database-url attribute or default
	 */
	get databaseUrl() {
		return (
			this.getAttribute("database-url") ||
			"https://workers.joblist.today"
		);
	}
	/**
	 * Gets the initial query value.
	 * 
	 * @returns {string} The query from the query attribute
	 */
	get query() {
		return this.getAttribute("query");
	}

	/**
	 * Gets the search type filter.
	 * 
	 * @returns {string} The search type: "companies", "jobs", or "both" (default)
	 */
	get searchType() {
		return this.getAttribute("search-type") || "both"; // "companies", "jobs", or "both"
	}

	/**
	 * Gets the result limit for search queries.
	 * 
	 * @returns {number} The maximum number of results to return (default: 1000)
	 */
	get limit() {
		const val = Number(this.getAttribute("limit"));
		return Number.isFinite(val) && val >= 0 ? val : 1000; // default higher to reduce truncation
	}

	/**
	 * Performs a search operation for companies and/or jobs.
	 * Handles both regular searches and highlighted content loading.
	 * 
	 *
	 * @param {string} [query=""] - The search query string
	 * @param {string|null} [searchType=null] - Override search type ("companies", "jobs", "both")
	 * @returns {Promise<Object>} Search result object with jobs, companies, and metadata
	 */
	async search(query = "", searchType = null) {
		const activeSearchType = searchType || this.searchType;
		let companies = [], jobs = [];
		let isHighlightedQuery = false;
		
		try {
			if (activeSearchType === "companies" || activeSearchType === "both") {
				if (!query || query.trim() === "") {
					companies = await this.joblistSDK.getCompaniesHighlighted();
					isHighlightedQuery = true;
				} else {
					companies = await this.joblistSDK.searchCompanies(query, this.limit);
				}
			}
			
			if (activeSearchType === "jobs" || activeSearchType === "both") {
				if (!query || query.trim() === "") {
					if (isHighlightedQuery || activeSearchType === "jobs") {
						jobs = await this.joblistSDK.getJobsFromHighlightedCompanies(this.limit);
					}
				} else {
					jobs = await this.joblistSDK.searchJobs(query, this.limit);
				}
			}
		} catch (e) {
			console.error("Search error:", e.message);
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
		
		
		const resultEvent = new CustomEvent("search", {
			bubbles: false,
			detail: result,
		});
		this.dispatchEvent(resultEvent);
		return result;
	}

	/**
	 * Creates an instance of JoblistSearch.
	 * Initializes debouncing and column storage properties.
	 */
	constructor() {
		super();
		this.debounceTimeout = null;
		this.debouncingDelay = 333;
		this.columns = { companies: [], jobs: [] };
	}

	/**
	 * Lifecycle callback when component is added to DOM.
	 * Initializes the DuckDB SDK, loads column metadata, and performs initial search.
	 * 
	 *
	 */
	async connectedCallback() {
		this.joblistSDK = new JoblistDuckDBSDK(this.databaseUrl);
		await this.joblistSDK.initialize();
		// Load searchable columns for suggestions
		try {
			this.columns.companies = await this.joblistSDK.getColumns("companies");
		} catch {}
		try {
			this.columns.jobs = await this.joblistSDK.getColumns("jobs");
		} catch {}
		
		// Listen for external search trigger events
		this.addEventListener('search-trigger', this._onSearchTrigger.bind(this));
		
		if (this.query) {
			this.search(this.query);
		} else {
			// Load highlighted companies by default when no query
			this.search("");
		}
		this._render(this.query);
	}
	/**
	 * Renders the search component UI.
	 * Creates the search input, filter options, and column suggestions.
	 * 
	 * @private
	 * @param {string} [query=""] - Initial query value to populate
	 */
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

		// Column suggestions via datalist
		const listId = "joblist-search-columns";
		$input.setAttribute("list", listId);
		const $datalist = document.createElement("datalist");
		$datalist.id = listId;
		let cols = [];
		if (this.searchType === "companies") cols = this.columns.companies;
		else if (this.searchType === "jobs") cols = this.columns.jobs;
		else cols = Array.from(new Set([...(this.columns.companies || []), ...(this.columns.jobs || [])]));
		cols
			.filter(Boolean)
			.sort()
			.forEach((c) => {
				const opt = document.createElement("option");
				opt.value = `${c}:`;
				$datalist.appendChild(opt);
			});
		
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
		
		this.replaceChildren(style, container, $datalist);
	}

	/**
	 * Debounces input events to prevent excessive search requests.
	 * 
	 * @private
	 * @param {Event} event - The input event
	 */
	_debounceOnInput(event) {
		if (this.debounceTimeout) {
			clearTimeout(this.debounceTimeout);
		}
		this.debounceTimeout = setTimeout(
			() => this._onInput(event),
			this.debouncingDelay,
		);
	}

	/**
	 * Handles debounced input events and triggers search.
	 * 
	 * @private
	 *
	 * @param {Event} event - The input event
	 */
	async _onInput(event) {
		const { value: query } = event.target;
		this.search(query);
	}

	/**
	 * Handles external search trigger events.
	 * Performs search with current attribute values.
	 * 
	 * @private
	 *
	 * @param {CustomEvent} event - The search trigger event
	 */
	async _onSearchTrigger(event) {
		// Triggered externally to perform a search with current attributes
		const query = this.getAttribute("query") || "";
		const searchType = this.getAttribute("search-type") || "both";
		this.search(query, searchType);
	}

	/**
	 * Handles search type filter changes.
	 * Updates the search-type attribute and triggers a new search.
	 * 
	 * @private
	 *
	 * @param {Event} event - The filter change event
	 */
	async _onFilterChange(event) {
		const newSearchType = event.target.value;
		this.setAttribute("search-type", newSearchType);
		
		// Always re-run search on filter change so defaults (eg. highlighted jobs) load
		const input = this.querySelector('input[type="search"]');
		const currentQuery = input ? input.value : "";
		this.search(currentQuery, newSearchType);
		this._render(currentQuery);
	}

	/**
	 * Handles coordinate-based search input.
	 * Searches for companies within a geographic radius.
	 * 
	 * @private
	 *
	 * @param {Event} [event={ target: { value: {} } }] - Event containing coordinate data
	 * @param {Object} event.target.value - Coordinate search parameters
	 * @param {number} [event.target.value.lat=52.52] - Latitude coordinate
	 * @param {number} [event.target.value.lon=13.405] - Longitude coordinate
	 * @param {number} [event.target.value.radius=0.1] - Search radius
	 * @returns {Promise<Object>} Search results with companies and jobs
	 */
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
