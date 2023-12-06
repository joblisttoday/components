/* import { createDbWorker } from 'sql.js-httpvfs'; */
import initSqlJs from "sql.js";

export class JoblistSDK {
	constructor(databaseUrl = `https://joblist.gitlab.io/workers/joblist.db`) {
		this.databaseUrl = databaseUrl;
	}

	async initialize() {
		const sqlPromise = initSqlJs({
			/* locateFile: file => `https://path/to/your/dist/folder/dist/${file}` */
			locateFile: (file) => `https://sql.js.org/dist/${file}`,
		});
		const dataPromise = fetch(this.databaseUrl).then((res) =>
			res.arrayBuffer(),
		);
		const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
		this.db = new SQL.Database(new Uint8Array(buf));
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
