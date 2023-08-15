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
		await this.executeQuery();
	}
	_render() {
		this.innerHTML = ''
		const $input = document.createElement('input')
		$input.addEventListener('input', this._onInput.bind(this))
		this.append($input)
	}
	_onInput(event) {
		const {value} = event.target
		this.executeQuery(value)
	}

	async executeQuery(search) {
		const result = await this.db.exec(`select * from companies where slug = ?`, search);
		debugger
		console.log(result);
	}
}

if (!customElements.get('joblist-search')) {
	customElements.define('joblist-search', Search);
}
