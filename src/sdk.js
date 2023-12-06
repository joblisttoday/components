import { sqlite3Worker1Promiser } from "@sqlite.org/sqlite-wasm";

const log = (...args) => console.log(...args);
const error = (...args) => console.error(...args);

export class JoblistSDK {
	constructor(databaseUrl = `https://joblist.gitlab.io/workers/joblist.db`) {
		this.databaseUrl = databaseUrl;
	}

	async initialize() {
		try {
			log("Loading and initializing SQLite3 module...");

			const promiser = await new Promise((resolve) => {
				const _promiser = sqlite3Worker1Promiser({
					onready: () => {
						resolve(_promiser);
					},
				});
			});

			log("Done initializing. Running demo...");

			let response;

			response = await promiser("config-get", {});
			log("Running SQLite3 version", response.result.version.libVersion);

			response = await promiser("open", {
				filename: `${this.databaseUrl}?vfs=opfs`,
			});

			console.log("db response", response);

			const { dbId } = response;
			log(
				"OPFS is available, created persisted database at",
				response.result.filename.replace(/^file:(.*?)\?vfs=opfs$/, "$1"),
			);
			// Your SQLite code here.
		} catch (err) {
			if (!(err instanceof Error)) {
				err = new Error(err.result.message);
			}
			error(err.name, err.message);
		}
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
			[query],
		);
	}

	async searchJobs(query = "") {
		return await this.executeQuery(
			`SELECT * FROM jobs_fts WHERE jobs_fts MATCH ?`,
			[query],
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

	async getLastAddedCompanies(limit = 10) {
		return await this.executeQuery(
			`SELECT * FROM companies ORDER BY rowid DESC LIMIT ?`,
			[limit],
		);
	}
}

export default new JoblistSDK();
