class Search extends HTMLElement {
	get placeholder() {
		return this.getAttribute('placeholder')
	}
	get DATABASE_URL() {
		return this.getAttribute('database-url') || `https://joblist.gitlab.io/workers/joblist.db`;
	}
	async _loadDbWorker() {
		const { createDbWorker } = await import('sql.js-httpvfs');
		return await createDbWorker(
			[this.config],
			this.workerUrl.toString(),
			this.wasmUrl.toString(),
			this.maxBytesToRead
		);
	}
	
	constructor() {
		super();
		this.workerUrl = new URL(
			"sql.js-httpvfs/dist/sqlite.worker.js",
			import.meta.url
		);
		this.wasmUrl = new URL(
			"sql.js-httpvfs/dist/sql-wasm.wasm",
			import.meta.url
		);
		this.config = {
			from: "inline",
			config: {
				serverMode: "full",
				requestChunkSize: 4096,
				url: this.DATABASE_URL
			}
		};
		this.maxBytesToRead = 10 * 1024 * 1024;
		this.debounceTimeout = null;
		this.debouncingDelay = 333;
	}
	
	async connectedCallback() {
		this.worker = await this._loadDbWorker();
		this.db = this.worker.db;
		this._render();
	}
	
	_render() {
		this.innerHTML = '';
		const $input = document.createElement('input');
		$input.type = "search";
		$input.placeholder = this.placeholder || "Search (eg. test OR free*)";
		$input.addEventListener('input', this._debounceOnInput.bind(this));
		this.append($input);
	}

	_debounceOnInput(event) {
		if (this.debounceTimeout) {
			clearTimeout(this.debounceTimeout);
		}
		this.debounceTimeout = setTimeout(() => this._onInput(event), this.debouncingDelay);
	}
	
	async _onInput(event) {
		const {value} = event.target;
		let companies, jobs;
		try {
			companies = await this.searchCompanies(value);
			jobs = await this.searchJobs(value);
		} catch (e) {
			console.info('Search error.', e);
		}
		const result = { jobs, companies };
		const resultEvent = new CustomEvent("search", {
			bubbles: false,
			detail: result,
		});
		this.dispatchEvent(resultEvent);
		return result;
	}

	async _onCoordinatesInput(event = { target: { value: {} } }) {
		const {
			value
		} = event.target
		const {
			lat = 52.5200,
			lon = 13.4050,
			radius = 0.1,
		} = value
		let companies, jobs;
		try {
			companies = await this.searchCompaniesByCoordinates(lat, lon, radius);
			/* @TODO jobs do not have positions in providers */
			/* jobs = await this.searchJobsByCoordinates(lat, lon, radius); */
		} catch (e) {
			console.info('Search error.', e);
		}
		const result = { jobs, companies };
		const resultEvent = new CustomEvent("search", {
			bubbles: false,
			detail: result,
		});
		this.dispatchEvent(resultEvent);
		return result;
	}
	
	async searchCompanies(query = "") {
		return await this.executeQuery(
			`SELECT * FROM companies_fts WHERE companies_fts MATCH ?`,
			[query]
		);
	}
	
	async searchJobs(query = "") {
		return await this.executeQuery(
			`SELECT * FROM jobs_fts WHERE jobs_fts MATCH ?`,
			[query]
		);
	}

	async searchCompaniesByCoordinates(lat, lon, radius) {
		const sql = `
	SELECT *
	FROM companies
	WHERE json_extract(json(positions), '$[0].map.coordinates') IS NOT NULL
	AND (
		(CAST(json_extract(json(positions), '$[0].map.coordinates[0]') AS REAL) - ?) * (? - CAST(json_extract(json(positions), '$[0].map.coordinates[0]') AS REAL)) + 
		(CAST(json_extract(json(positions), '$[0].map.coordinates[1]') AS REAL) - ?) * (? - CAST(json_extract(json(positions), '$[0].map.coordinates[1]') AS REAL)) <= ? * ?
	)`;
		const params = [lon, lon, lat, lat, radius, radius];
		return await this.executeQuery(sql, params);
	}

	async searchJobsByCoordinates(lat, lon, radius) {
		const sql = `
	SELECT *
	FROM jobs
	WHERE json_extract(json(positions), '$[0].map.coordinates') IS NOT NULL
	AND (
		(CAST(json_extract(json(positions), '$[0].map.coordinates[0]') AS REAL) - ?) * (? - CAST(json_extract(json(positions), '$[0].map.coordinates[0]') AS REAL)) + 
		(CAST(json_extract(json(positions), '$[0].map.coordinates[1]') AS REAL) - ?) * (? - CAST(json_extract(json(positions), '$[0].map.coordinates[1]') AS REAL)) <= ? * ?
	)`;
		const params = [lon, lon, lat, lat, radius, radius];
		return await this.executeQuery(sql, params);
	}


	async executeQuery(exec = "", params = []) {
		const result = await this.db.exec(exec, [...params]);
		const bytesRead = await this.worker.worker.bytesRead;
		this.worker.worker.bytesRead = 0;
		return result;
	}
}

if (!customElements.get('joblist-search')) {
	customElements.define('joblist-search', Search);
}
