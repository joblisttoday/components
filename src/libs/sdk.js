import { SQLiteDatabaseClient } from "npm:@observablehq/sqlite";

export const MATRIX_TYPE_JOB = "today.joblist.job";
export const MATRIX_ROOM_FILTER_JOB = {
	types: [MATRIX_TYPE_JOB],
};
export const MATRIX_ROOM_MAP = {
	general: "#general.boards.joblist.today:matrix.org",
};

export class JoblistSDK {
	constructor(databaseUrl = `https://joblist.gitlab.io/workers/joblist.db`) {
		this.databaseUrl = databaseUrl;
	}

	async initialize() {
		this.db = await SQLiteDatabaseClient.open(this.databaseUrl);
		return this.db;
	}

	executeQuery(exec = "", params = []) {
		return this.db.query(exec, [...params]);
	}

	getAllCompaniesData() {
		return this.executeQuery(`SELECT * FROM companies`);
	}

	getAllJobsData() {
		return this.executeQuery(`SELECT * FROM jobs`);
	}

	searchCompanies(query = "") {
		return this.executeQuery(
			`SELECT * FROM companies_fts WHERE companies_fts MATCH ?`,
			[query],
		);
	}
	searchJobs(query = "") {
		return this.executeQuery(`SELECT * FROM jobs_fts WHERE jobs_fts MATCH ?`, [
			query,
		]);
	}

	searchCompaniesByCoordinates(lat, lon, radius) {
		const sql = `
	SELECT *
	FROM companies
	WHERE json_extract(json(positions), '$[0].map.coordinates') IS NOT NULL
	AND (
		(CAST(json_extract(json(positions), '$[0].map.coordinates[0]') AS REAL) - ?) * (? - CAST(json_extract(json(positions), '$[0].map.coordinates[0]') AS REAL)) +
		(CAST(json_extract(json(positions), '$[0].map.coordinates[1]') AS REAL) - ?) * (? - CAST(json_extract(json(positions), '$[0].map.coordinates[1]') AS REAL)) <= ? * ?
	)`;
		const params = [lon, lon, lat, lat, radius, radius];
		return this.executeQuery(sql, params);
	}

	searchJobsByCoordinates(lat, lon, radius) {
		const sql = `
	SELECT *
	FROM jobs
	WHERE json_extract(json(positions), '$[0].map.coordinates') IS NOT NULL
	AND (
		(CAST(json_extract(json(positions), '$[0].map.coordinates[0]') AS REAL) - ?) * (? - CAST(json_extract(json(positions), '$[0].map.coordinates[0]') AS REAL)) +
		(CAST(json_extract(json(positions), '$[0].map.coordinates[1]') AS REAL) - ?) * (? - CAST(json_extract(json(positions), '$[0].map.coordinates[1]') AS REAL)) <= ? * ?
	)`;
		const params = [lon, lon, lat, lat, radius, radius];
		return this.executeQuery(sql, params);
	}

	getLastAddedCompanies(limit = 10) {
		return this.executeQuery(
			`SELECT * FROM companies ORDER BY rowid DESC LIMIT ?`,
			[limit],
		);
	}

	getCompanyHeatmap(slug, days = 365) {
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
  strftime('%u', date_range.min_date) AS dow,
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
		return this.executeQuery(sql, [days, slug, slug]);
	}
	getJobsHeatmap(days = 365) {
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
  strftime('%u', date_range.min_date) AS dow,
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
		return this.executeQuery(sql, [days]);
	}
}

export default new JoblistSDK();
