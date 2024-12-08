import { JoblistSqlSDK } from "../libs/sdk-sql.js";

export default class JoblistSearch extends HTMLElement {
	get placeholder() {
		return this.getAttribute("placeholder");
	}
	get databaseUrl() {
		return (
			this.getAttribute("database-url") ||
			`https://joblist.gitlab.io/workers/joblist.db`
		);
	}
	get query() {
		return this.getAttribute("query");
	}

	async search(query = "") {
		let companies, jobs;
		try {
			companies = await this.joblistSDK.searchCompanies(query);
			jobs = await this.joblistSDK.searchJobs(query);
		} catch (e) {
			console.info("Search error.", e);
		}
		const result = { jobs, companies, query };
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
		this.joblistSDK = new JoblistSqlSDK(this.databaseUrl);
		await this.joblistSDK.initialize();
		if (this.query) {
			this.search(this.query);
		}
		this._render(this.query);
	}
	_render(query = "") {
		const $input = document.createElement("input");
		$input.type = "search";
		$input.placeholder =
			this.placeholder || "Search query";
		$input.addEventListener("input", this._debounceOnInput.bind(this));
		if (query) {
			$input.value = query;
		}
		this.replaceChildren($input);
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
