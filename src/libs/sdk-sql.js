/* import { createDbWorker } from 'sql.js-httpvfs'; */
import initSqlJs from "sql.js";

export class JoblistSqlSDK {
	constructor(url = `https://joblist.gitlab.io/workers/joblist.db`) {
		this.url = url;
	}

	async initialize() {
		const sqlPromise = initSqlJs({
			locateFile: (file) => `https://sql.js.org/dist/${file}`,
		});
		const dataPromise = fetch(this.url).then((res) => res.arrayBuffer());
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

	async getCompanyHeatmap(slug, days = 365) {
		const sql = `
WITH RECURSIVE date_range AS (
  SELECT MIN(published_date) AS min_date, MAX(published_date) AS max_date FROM jobs
  WHERE published_date > DATE('now', '-' || ? || ' ' || 'days')
  UNION ALL
  SELECT date(min_date, '+1 day'), max_date FROM date_range WHERE min_date < max_date
)
SELECT
  COALESCE(company_slug, ?) AS company_slug,
  date_range.min_date AS date,
  COALESCE(COUNT(DISTINCT ObjectId), 0) AS total,
  strftime('%Y', date_range.min_date) AS year,
  strftime('%w', date_range.min_date) AS dow,
  strftime('%W', date_range.min_date) AS woy
FROM
  date_range
LEFT JOIN
  jobs ON date_range.min_date = jobs.published_date
AND company_slug = ?
OR company_slug is null
GROUP BY 1,2
ORDER BY published_date ASC;
		`;
		const params = [days, slug, slug];
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
