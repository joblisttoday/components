import { createDbWorker } from 'sql.js-httpvfs';

export class JoblistSDK {
	constructor(databaseUrl = `https://joblist.gitlab.io/workers/joblist.db`) {
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
				url: databaseUrl
			}
		};
		this.maxBytesToRead = 10 * 1024 * 1024;
	}

	async initialize() {
		this.worker = await createDbWorker(
			[this.config],
			this.workerUrl.toString(),
			this.wasmUrl.toString(),
			this.maxBytesToRead
		);
		this.db = this.worker.db;
	}

	async executeQuery(exec = "", params = []) {
		const result = await this.db.exec(exec, [...params]);
		return result;
	}

	async getAllCompaniesData() {
		return await this.executeQuery(`SELECT * FROM companies`);
	}

	async getAllJobsData() {
		return await this.executeQuery(`SELECT * FROM jobs`);
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
}

export default new JoblistSDK()
