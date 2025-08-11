import * as duckdb from "@duckdb/duckdb-wasm";
import { generateMissingDates } from "../utils/heatmap.js";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import duckdb_worker_eh from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";

export class JoblistDuckDBSDK {
	constructor(baseParquetUrl = "https://workers.joblist.today", options = {}) {
		this.baseParquetUrl = baseParquetUrl.replace(/\/$/, "");
		this.mode = "buffer"; // Use buffer mode for reliability like working version
		this.db = null;
		this.conn = null;
		this._registered = new Set();
	}

	async initialize() {
		if (this.db) return; // already initialized

		console.log("🔧 Initializing DuckDB...");
		
		const bundle = await duckdb.selectBundle({
			eh: { mainModule: duckdb_wasm_eh, mainWorker: duckdb_worker_eh },
		});
		
		const worker = new Worker(bundle.mainWorker);
		const logger = new duckdb.ConsoleLogger();
		const db = new duckdb.AsyncDuckDB(logger, worker);
		await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

		const conn = await db.connect();
		
		// Use same HTTP configuration as working version
		try {
			await conn.query(
				"INSTALL httpfs; LOAD httpfs; SET enable_http_metadata_cache=true; SET http_metadata_cache_size=10485760; SET enable_object_cache=true;"
			);
			console.log("✅ httpfs loaded successfully");
		} catch (e) {
			console.log("⚠️ httpfs configuration:", e.message);
		}

		this.db = db;
		this.conn = conn;
		console.log("✅ DuckDB initialization complete");
	}

	parquetUrl(tableName) {
		const safe = String(tableName).replace(/[^A-Za-z0-9_-]/g, "");
		return `${this.baseParquetUrl}/${safe}.parquet`;
	}

	async registerFileBuffer(name, buffer) {
		await this.db.registerFileBuffer(name, new Uint8Array(buffer));
		this._registered.add(name);
		return name;
	}

	async fetchAndRegister(name, url) {
		const res = await fetch(url, { mode: "cors" });
		if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
		const buf = await res.arrayBuffer();
		return await this.registerFileBuffer(name, buf);
	}

	async ensureParquetRegistered(vname, url) {
		if (this._registered.has(vname)) return vname;
		await this.fetchAndRegister(vname, url);
		return vname;
	}

	async query(sql, params = []) {
		if (!this.conn) throw new Error("DuckDB not initialized");
		
		// Simple parameter substitution
		let processedSql = sql;
		params.forEach((param, index) => {
			const placeholder = new RegExp(`\\$${index + 1}|\\?`, "g");
			const escaped = String(param).replace(/'/g, "''");
			processedSql = processedSql.replace(placeholder, `'${escaped}'`);
		});

		const table = await this.conn.query(processedSql);
		return table.toArray().map(row => Object.fromEntries(table.schema.fields.map((field, i) => [field.name, row[i]])));
	}

	_rowsToPlain(rows) {
		const convert = (val) => {
			if (typeof val === "bigint") return Number(val);
			if (Array.isArray(val)) return val.map(convert);
			if (val && typeof val === "object") {
				const out = {};
				for (const k of Object.keys(val)) out[k] = convert(val[k]);
				// Coerce known schema fields
				if (Array.isArray(out.tags)) {
					// ok
				} else if (typeof out.tags === "string") {
					try {
						const p = JSON.parse(out.tags);
						out.tags = Array.isArray(p)
							? p
							: typeof p === "string"
								? p
										.split(",")
										.map((s) => s.trim())
										.filter(Boolean)
								: [];
					} catch {
						out.tags = out.tags
							.split(",")
							.map((s) => s.trim())
							.filter(Boolean);
					}
				} else if (out.tags == null) {
					out.tags = [];
				}
				// Normalize positions to an array of objects
				if (Array.isArray(out.positions)) {
					// ok
				} else if (typeof out.positions === "string") {
					try {
						const p = JSON.parse(out.positions);
						out.positions = Array.isArray(p) ? p : [];
					} catch {
						out.positions = [];
					}
				} else if (out.positions == null) {
					out.positions = [];
				}
				return out;
			}
			return val;
		};
		return rows.map(convert);
	}

	// Core methods
	async searchCompanies(query = "") {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "companies.parquet";
		const url = this.parquetUrl("companies");
		await this.ensureParquetRegistered(vname, url);
		
		if (!query.trim()) {
			return await this.getCompaniesHighlighted();
		}

		const searchQuery = query.toLowerCase().trim().replace(/'/g, "''");
		const sql = `
			SELECT * FROM '${vname}'
			WHERE lower(id) LIKE '%${searchQuery}%'
			   OR lower(title) LIKE '%${searchQuery}%'
			   OR lower(cast(tags as varchar)) LIKE '%${searchQuery}%'
			LIMIT 100
		`;
		
		const table = await this.conn.query(sql);
		return this._rowsToPlain(table.toArray());
	}

	async getCompaniesHighlighted() {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "companies.parquet";
		const url = this.parquetUrl("companies");
		await this.ensureParquetRegistered(vname, url);
		
		const sql = `SELECT * FROM '${vname}' WHERE is_highlighted = true OR is_highlighted = 1 OR lower(cast(is_highlighted as varchar)) = 'true'`;
		const table = await this.conn.query(sql);
		return this._rowsToPlain(table.toArray());
	}

	async searchJobs(query = "") {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "jobs.parquet";
		const url = this.parquetUrl("jobs");
		
		try {
			await this.ensureParquetRegistered(vname, url);
		} catch (e) {
			console.log("Jobs parquet file not found or failed to load:", e.message);
			return []; // Return empty array if jobs file doesn't exist
		}
		
		if (!query.trim()) {
			return await this.getJobsFromHighlightedCompanies();
		}

		const searchQuery = query.toLowerCase().trim().replace(/'/g, "''");
		const sql = `
			SELECT * FROM '${vname}' 
			WHERE lower(name) LIKE '%${searchQuery}%'
			   OR lower(company_id) LIKE '%${searchQuery}%'
			   OR lower(company_title) LIKE '%${searchQuery}%'
			   OR lower(location) LIKE '%${searchQuery}%'
			LIMIT 100
		`;
		
		try {
			const table = await this.conn.query(sql);
			return this._rowsToPlain(table.toArray());
		} catch (e) {
			console.log("Failed to query jobs:", e.message);
			return [];
		}
	}

	async getJobsFromHighlightedCompanies() {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const companiesVname = "companies.parquet";
		const jobsVname = "jobs.parquet";
		const companiesUrl = this.parquetUrl("companies");
		const jobsUrl = this.parquetUrl("jobs");
		
		try {
			await this.ensureParquetRegistered(companiesVname, companiesUrl);
			await this.ensureParquetRegistered(jobsVname, jobsUrl);
		} catch (e) {
			console.log("Failed to load companies or jobs parquet files:", e.message);
			return [];
		}
		
		const sql = `
			SELECT j.* FROM '${jobsVname}' j
			INNER JOIN '${companiesVname}' c ON j.company_id = c.id
			WHERE c.is_highlighted = true OR c.is_highlighted = 1 OR lower(cast(c.is_highlighted as varchar)) = 'true'
			LIMIT 100
		`;
		
		try {
			const table = await this.conn.query(sql);
			return this._rowsToPlain(table.toArray());
		} catch (error) {
			console.log("Jobs parquet file not found or failed to load:", error.message);
			return [];
		}
	}

	async getCompany(id) {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "companies.parquet";
		const url = this.parquetUrl("companies");
		await this.ensureParquetRegistered(vname, url);
		
		const lit = String(id).replace(/'/g, "''");
		const sql = `SELECT * FROM '${vname}' WHERE id = '${lit}' LIMIT 1`;
		const table = await this.conn.query(sql);
		const rows = this._rowsToPlain(table.toArray());
		return rows[0] || null;
	}

	// Heatmap methods - now implemented like working version
	async getCompanyHeatmap(id, days = 365, signal) {
		if (!this.conn) throw new Error("DuckDB not initialized");
		
		let data;
		try {
			const jobsVname = "jobs.parquet";
			const jobsUrl = this.parquetUrl("jobs");
			await this.ensureParquetRegistered(jobsVname, jobsUrl);
			
			const sql = `
				SELECT COUNT(*) AS total, company_id, published_date AS date 
				FROM '${jobsVname}' 
				WHERE published_date >= (CURRENT_DATE - ${days})::VARCHAR AND company_id = ?
				GROUP BY published_date, company_id
				ORDER BY published_date DESC
			`;
			data = await this.query(sql, [id]);
		} catch (e) {
			console.warn("Company heatmap failed:", e.message);
			data = [];
		}
		
		return generateMissingDates(data, days);
	}

	async getJobsHeatmap(days = 365, signal) {
		if (!this.conn) throw new Error("DuckDB not initialized");
		
		let data;
		try {
			const jobsVname = "jobs.parquet";
			const jobsUrl = this.parquetUrl("jobs");
			await this.ensureParquetRegistered(jobsVname, jobsUrl);
			
			const sql = `
				SELECT COUNT(*) AS total, company_id, published_date AS date 
				FROM '${jobsVname}' 
				WHERE published_date >= (CURRENT_DATE - ${days})::VARCHAR
				GROUP BY published_date, company_id
				ORDER BY published_date DESC
			`;
			data = await this.query(sql, []);
		} catch (e) {
			console.warn("Jobs heatmap failed:", e.message);
			data = [];
		}
		
		if (!signal?.aborted) {
			return generateMissingDates(data, days);
		}
	}

	// Additional methods needed by components
	async getStats() {
		if (!this.conn) throw new Error("DuckDB not initialized");

		let total_companies = 0;
		let total_jobs = 0;

		// Get company count
		try {
			const companiesVName = "companies.parquet";
			const companiesUrl = this.parquetUrl("companies");
			await this.ensureParquetRegistered(companiesVName, companiesUrl);
			const companyQuery = await this.conn.query(`SELECT COUNT(*) as count FROM '${companiesVName}'`);
			const companyRows = companyQuery.toArray();
			total_companies = Number(companyRows[0]?.count ?? 0);
		} catch (e) {
			console.log("Failed to get company count:", e.message);
		}

		// Get jobs count
		try {
			const jobsVName = "jobs.parquet";
			const jobsUrl = this.parquetUrl("jobs");
			await this.ensureParquetRegistered(jobsVName, jobsUrl);
			const jobsQuery = await this.conn.query(`SELECT COUNT(*) as count FROM '${jobsVName}'`);
			const jobsRows = jobsQuery.toArray();
			total_jobs = Number(jobsRows[0]?.count ?? 0);
		} catch (e) {
			console.log("Failed to get jobs count:", e.message);
		}

		return { total_companies, total_jobs };
	}

	async getCompanies() {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "companies.parquet";
		const url = this.parquetUrl("companies");
		await this.ensureParquetRegistered(vname, url);
		
		const table = await this.conn.query(`SELECT * FROM '${vname}'`);
		return this._rowsToPlain(table.toArray());
	}

	async getAllCompaniesWithJobs() {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const companiesVname = "companies.parquet";
		const jobsVname = "jobs.parquet";
		const companiesUrl = this.parquetUrl("companies");
		const jobsUrl = this.parquetUrl("jobs");

		try {
			await this.ensureParquetRegistered(companiesVname, companiesUrl);
			await this.ensureParquetRegistered(jobsVname, jobsUrl);
		} catch (e) {
			console.log("Failed to load companies or jobs parquet files:", e.message);
			// If jobs don't exist, just return all companies
			return await this.getCompanies();
		}

		// Join companies with jobs, fall back to all companies if it fails
		try {
			const sql = `
				SELECT DISTINCT c.*
				FROM '${companiesVname}' c
				INNER JOIN '${jobsVname}' j ON c.id = j.company_id
			`;
			
			const table = await this.conn.query(sql);
			return this._rowsToPlain(table.toArray());
		} catch (e) {
			console.log("Failed to join companies with jobs, returning all companies:", e.message);
			return await this.getCompanies();
		}
	}

	async getAllCompaniesData() {
		return await this.getCompanies();
	}

	async getAllJobsData() {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "jobs.parquet";
		const url = this.parquetUrl("jobs");

		try {
			await this.ensureParquetRegistered(vname, url);
		} catch (e) {
			console.log("Jobs parquet file not found:", e.message);
			return [];
		}

		try {
			const table = await this.conn.query(`SELECT * FROM '${vname}'`);
			return this._rowsToPlain(table.toArray());
		} catch (e) {
			console.log("Failed to load jobs data:", e.message);
			return [];
		}
	}

	async dispose() {
		try {
			if (this.conn) await this.conn.close();
		} finally {
			this.conn = null;
			this.db = null;
		}
	}
}

const joblistDuckDBSDK = new JoblistDuckDBSDK();
export default joblistDuckDBSDK;
