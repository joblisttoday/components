class Search extends HTMLElement {
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
		this.DATABASE_URL = `https://joblist.gitlab.io/workers/joblist.db`;
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
	}

	async connectedCallback() {
		this.worker = await this._loadDbWorker();
		this.db = this.worker.db
		this._render();
	}
	_render() {
		this.innerHTML = ''
		const $input = document.createElement('input')
		$input.type = "search"
		$input.placeholder = "Search"
		$input.addEventListener('input', this._onInput.bind(this))
		this.append($input)
	}
	async _onInput(event) {
		event.preventDefault()
		const {value} = event.target
		const result = await this.searchCompanies(value)
		const resultEvent = new CustomEvent("search", {
			bubbles: false,
			detail: result,
		});
		this.dispatchEvent(resultEvent);
		return result
	}
	async searchCompaniesBySlug(search = "ableton") {
		return await this.executeQuery(
			`SELECT * FROM companies WHERE slug = ?`,
			[search]
		)
	}
	async searchCompanies(query = "") {
		const rows = await this.executeQuery(`
				SELECT *
				FROM companies_fts
				WHERE companies_fts MATCH ?
		`, [query]);
		return rows;
	};
	async searchJobs(query = "") {
		const rows = await this.executeQuery(`
				SELECT *
				FROM jobs_fts
				WHERE jobs_fts MATCH ?
		`, [query]);
		return rows;
	};
	async executeQuery(exec = "", params = []) {
		const result = await this.db.exec(exec, [...params]);
		const bytesRead = await this.worker.worker.bytesRead;
		this.worker.worker.bytesRead = 0;
		return result
	}
}

if (!customElements.get('joblist-search')) {
	customElements.define('joblist-search', Search);
}
