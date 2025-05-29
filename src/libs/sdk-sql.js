/* import { createDbWorker } from 'sql.js-httpvfs'; */
import { sqliteToJson } from "../utils/sqlite.js";
import { Company } from "../utils/models.js";
import initSqlJs from "sql.js";
import workletURL from "sql.js/dist/sql-wasm.wasm?url";

export class JoblistSqlSDK {
	constructor(url = "https://workers.joblist.today.github.io/joblist.db") {
		this.url = url;
	}

	async initialize() {
		/* https://github.com/sql-js/sql.js/issues/467#issuecomment-2015608979 */
		const sqlPromise = await initSqlJs({
			locateFile: (file) => workletURL,
		});
		const dataPromise = fetch(this.url).then((res) => res.arrayBuffer());
		const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
		this.db = new SQL.Database(new Uint8Array(buf));
	}

	async executeQuery(exec = "", params = []) {
		const result = await this.db.exec(exec, [...params]);
		return sqliteToJson(result);
	}

	async getAllCompaniesData() {
		let res;
		try {
			res = await this.executeQuery(`SELECT * FROM companies`);
		} catch (e) {
			throw e;
		}
		return res.map((c) => new Company(c));
	}

	async getAllCompaniesWithJobs() {
		let res;
		try {
			res = await this.executeQuery(`SELECT companies.*,
COUNT(jobs.id) AS total_jobs
FROM companies
LEFT JOIN jobs ON companies.id = jobs.company_id
GROUP BY companies.id
HAVING (companies.job_board_provider IS NOT NULL AND companies.job_board_hostname IS NOT NULL) OR COUNT(jobs.id) > 0;
`);
		} catch (e) {
			throw e;
		}
		return res.map((c) => new Company(c));
	}

	async getAllJobsData() {
		return await this.executeQuery(`SELECT * FROM jobs`);
	}

	async searchCompanies(query = "") {
		let res;
		try {
			res = await this.executeQuery(
				`SELECT companies.*, companies_fts.* FROM companies
				 JOIN companies_fts ON companies.id = companies_fts.id
				 WHERE companies_fts MATCH ?`,
				[query],
			);
		} catch (e) {
			throw e;
		}
		return res?.map((c) => new Company(c));
	}

	async searchJobs(query = "") {
		return await this.executeQuery(
			`SELECT jobs.*, jobs_fts.* FROM jobs
				 JOIN jobs_fts ON jobs.id = jobs_fts.id
				 WHERE jobs_fts MATCH ?`,
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

	async getCompanyHeatmap(id, days = 365) {
		const sql = `
WITH RECURSIVE date_range AS (
	SELECT MIN(published_date) AS min_date, MAX(published_date) AS max_date FROM jobs
	WHERE published_date > DATE('now', '-' || ? || ' ' || 'days')
	UNION ALL
	SELECT date(min_date, '+1 day'), max_date FROM date_range WHERE min_date < max_date
)
SELECT
	COALESCE(company_id, ?) AS company_id,
	date_range.min_date AS date,
	COALESCE(COUNT(DISTINCT ObjectId), 0) AS total,
	strftime('%Y', date_range.min_date) AS year,
	strftime('%w', date_range.min_date) AS dow,
	strftime('%W', date_range.min_date) AS woy
FROM
	date_range
LEFT JOIN
	jobs ON date_range.min_date = jobs.published_date
AND company_id = ?
OR company_id is null
GROUP BY 1,2
ORDER BY published_date ASC;
		`;
		const params = [days, id, id];
		const result = await this.executeQuery(sql, params);
		if (result) {
			const { values, columns } = result[0];
			return values.map((row) => {
				return row.reduce((acc, col, i) => {
					acc[columns[i]] = col;
					return acc;
				}, {});
			});
		}
	}
	async getJobsHeatmap(days = 365) {
		const sql = `
WITH RECURSIVE date_range AS (
	SELECT
		MIN(published_date) AS min_date,
		MAX(published_date) AS max_date
	FROM jobs
	WHERE published_date > DATE('now', '-' || ? || ' days')
	UNION ALL
	SELECT DATE(min_date, '+1 day'), max_date
	FROM date_range
	WHERE min_date < max_date
)
SELECT
	date_range.min_date AS date,
	COALESCE(COUNT(DISTINCT jobs.ObjectId), 0) AS total,
	strftime('%Y', date_range.min_date) AS year,
	strftime('%m', date_range.min_date) AS month,
	strftime('%w', date_range.min_date) AS dow,
	strftime('%j', date_range.min_date) AS doy,
	strftime('%W', date_range.min_date) AS woy
FROM
	date_range
LEFT JOIN
	jobs ON DATE(date_range.min_date) = DATE(jobs.published_date)
GROUP BY
	date_range.min_date
ORDER BY
	date_range.min_date ASC;
		`;
		const params = [days];
		const result = await this.executeQuery(sql, params);
		if (result) {
			const { values, columns } = result[0];
			return values.map((row) => {
				return row.reduce((acc, col, i) => {
					acc[columns[i]] = col;
					return acc;
				}, {});
			});
		}
	}
}

export default new JoblistSqlSDK();
