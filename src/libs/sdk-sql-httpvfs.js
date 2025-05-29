import { sqliteToJson } from "../utils/sqlite.js";
import { createDbWorker } from "sql.js-httpvfs";

const workerUrl = new URL(
	"sql.js-httpvfs/dist/sqlite.worker.js",
	import.meta.url,
);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

const config = {
	from: "inline",
	config: {
		serverMode: "full",
		requestChunkSize: 4096,
		url: "https://workers.joblist.today/joblist.db",
	},
};

export class JoblistSqlHttpvfsSDK {
	constructor(url = "https://workers.joblist.today/joblist.db") {
		this.url = url;
	}

	async initialize() {
		const worker = await createDbWorker(
			[config],
			workerUrl.toString(),
			wasmUrl.toString(),
			10 * 1024 * 1024,
		);
		this.db = worker.db;
	}

	async executeQuery(exec = "", params = []) {
		const result = await this.db.exec(exec, [...params]);
		return sqliteToJson(result);
	}

	async getStats() {
		let res;
		try {
			res = await this.executeQuery(`
		SELECT
			(SELECT total_companies FROM companies_analyze) AS total_companies,
			(SELECT total_jobs FROM jobs_analyze) AS total_jobs
			`);
		} catch (e) {
			throw e;
		}
		return res[0];
	}

	async getCompanies() {
		let res;
		try {
			res = await this.executeQuery(`SELECT * from companies`);
		} catch (e) {
			throw e;
		}
		return res;
	}
	async getCompany(id) {
		let res;
		try {
			res = await this.executeQuery(`SELECT * from companies WHERE id = ?`, [
				id,
			]);
		} catch (e) {
			throw e;
		}
		return res[0];
	}
}

export default new JoblistSqlHttpvfsSDK();
