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
		this.ftsEnabled = false;
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

		// Try to enable FTS; ignore if unavailable in this WASM build
		try {
			await conn.query("INSTALL fts; LOAD fts;");
			this.ftsEnabled = true;
			console.log("✅ FTS extension loaded");
		} catch (e) {
			this.ftsEnabled = false;
			console.log("ℹ️ FTS extension not available:", e.message);
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

	async ensureViewForParquet(viewName, vname) {
		// Create a stable view name for FTS to target; safe if it already exists
		try {
			await this.conn.query(`CREATE VIEW IF NOT EXISTS ${viewName} AS SELECT * FROM '${vname}'`);
			return true;
		} catch (e) {
			console.log(`Failed to create view ${viewName}:`, e.message);
			return false;
		}
	}

	async createFTSIndex(viewName, idColumn, fields = []) {
		if (!this.ftsEnabled) return false;
		try {
			const cols = (fields && fields.length)
				? ", " + fields.map((c) => `'${c}'`).join(", ")
				: ", '*'"; // index all VARCHAR columns if fields omitted
			await this.conn.query(`PRAGMA create_fts_index('${viewName}', '${idColumn}'${cols})`);
			return true;
		} catch (e) {
			// Index may already exist or schema unsupported; treat as non-fatal
			console.log(`FTS index for ${viewName} not created:`, e.message);
			return false;
		}
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

	// Parse field-specific syntax like "tags:hardware" or "id:ableton"
	_parseFieldSearch(raw = "") {
		const q = String(raw || "").trim();
		const m = q.match(/^([a-zA-Z_][a-zA-Z0-9_]*):(.*)$/);
		if (!m) return { field: null, term: q };
		const field = m[1].toLowerCase();
		const term = String(m[2] || "").trim();
		if (!term) return { field: null, term: q };
		return { field, term };
	}

	_escapeLikeTerm(s = "") {
		return String(s).toLowerCase().trim().replace(/'/g, "''");
	}

	// Parse simple boolean search: supports a single operator (AND/OR) across terms.
	// Examples:
	//  - "tags:transports AND spacex" -> op AND; groups [{field:'tags', term:'transports'}, {field:null, term:'spacex'}]
	//  - "company:acme OR location:berlin" -> op OR; two field groups
	_parseBooleanSearch(raw = "") {
		const q = String(raw || "").trim();
		if (!q) return { op: "AND", groups: [] };
		const parts = q.split(/\s+(AND|OR)\s+/i);
		let op = "AND";
		let terms = [];
		if (parts.length > 1) {
			// parts like [term1, op, term2, op, term3 ...]; use first op if consistent
			const ops = parts.filter((_, i) => i % 2 === 1).map((s) => s.toUpperCase());
			op = ops.every((o) => o === ops[0]) ? ops[0] : "AND";
			terms = parts.filter((_, i) => i % 2 === 0);
		} else {
			terms = [q];
		}
		const groups = terms
			.map((t) => t.trim())
			.filter(Boolean)
			.map((t) => {
				const m = t.match(/^([a-zA-Z_][a-zA-Z0-9_]*):(.*)$/);
				if (m) return { field: m[1].toLowerCase(), term: (m[2] || "").trim() };
				return { field: null, term: t };
			})
			.filter((g) => g.term);
		return { op, groups };
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

		const { op, groups } = this._parseBooleanSearch(query);
		const makeLikeCond = (g) => {
			const term = this._escapeLikeTerm(g.term);
			if (g.field === "tags") return `lower(cast(tags as varchar)) LIKE '%${term}%'`;
			if (g.field === "id" || g.field === "title") return `lower(cast(${g.field} as varchar)) LIKE '%${term}%'`;
			// generic
			return `(
				lower(id) LIKE '%${term}%'
				OR lower(title) LIKE '%${term}%'
				OR lower(cast(tags as varchar)) LIKE '%${term}%'
			)`;
		};
		const joiner = op === "OR" ? " OR " : " AND ";
		const whereLike = groups.length ? groups.map(makeLikeCond).join(joiner) : "TRUE";
		const sql = `SELECT * FROM '${vname}' WHERE ${whereLike} LIMIT 100`;
		
		// Try FTS (bm25) if available
		if (this.ftsEnabled) {
			try {
				const viewName = "companies_v";
				await this.ensureViewForParquet(viewName, vname);
				// Use id as the document identifier
				await this.createFTSIndex(viewName, "id", ["id", "title", "tags"]);
				const ftsSchema = `fts_main_${viewName}`;
				// Group by field for FTS
				const byField = groups.reduce((acc, g) => {
					const key = g.field && ["id", "title", "tags"].includes(g.field) ? g.field : "__generic";
					(acc[key] ||= []).push(this._escapeLikeTerm(g.term));
					return acc;
				}, {});
				const scoreCols = [];
				const selectScores = Object.entries(byField)
					.map(([key, terms], i) => {
						const fieldsArg = key !== "__generic" ? `, fields := '${key}'` : "";
						const conjArg = `, conjunctive := ${op === 'OR' ? 0 : 1}`;
						const qstr = terms.join(" ");
						const col = `score_${i+1}`;
						scoreCols.push(col);
						return `${ftsSchema}.match_bm25(id, '${qstr}'${fieldsArg}${conjArg}) AS ${col}`;
					})
					.join(",\n\t\t\t\t\t\t");
				const whereScores = scoreCols.map((c) => `${c} IS NOT NULL`).join(op === 'OR' ? ' OR ' : ' AND ');
				const orderExpr = scoreCols.map((c) => `COALESCE(${c}, 0)`).join(" + ");
				const ftsSql = `
					SELECT * FROM (
						SELECT c.*,\n\t\t\t\t\t\t${selectScores}
						FROM ${viewName} c
					) sq
					WHERE ${whereScores}
					ORDER BY ${orderExpr} DESC
					LIMIT 100
				`;
				const ftsTable = await this.conn.query(ftsSql);
				const ftsRows = ftsTable.toArray();
				if (ftsRows.length) return this._rowsToPlain(ftsRows);
			} catch (e) {
				console.log("Companies FTS search failed, falling back to LIKE:", e.message);
			}
		}

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

		const { op, groups } = this._parseBooleanSearch(query);
		const fieldMap = {
			name: "name",
			location: "location",
			company: "company_title",
			company_title: "company_title",
			company_id: "company_id",
			id: "company_id",
		};
		const makeLikeCond = (g) => {
			const term = this._escapeLikeTerm(g.term);
			if (g.field && fieldMap[g.field]) return `lower(cast(${fieldMap[g.field]} as varchar)) LIKE '%${term}%'`;
			// generic
			return `(
				lower(name) LIKE '%${term}%'
				OR lower(company_id) LIKE '%${term}%'
				OR lower(company_title) LIKE '%${term}%'
				OR lower(location) LIKE '%${term}%'
			)`;
		};
		const joiner = op === "OR" ? " OR " : " AND ";
		const whereLike = groups.length ? groups.map(makeLikeCond).join(joiner) : "TRUE";
		let sql = `SELECT * FROM '${vname}' WHERE ${whereLike} LIMIT 100`;
		
		// Try FTS (bm25) if available
		if (this.ftsEnabled) {
			try {
				const viewName = "jobs_v";
				await this.ensureViewForParquet(viewName, vname);
				// Use url as the document identifier if present
				await this.createFTSIndex(viewName, "url", [
					"name",
					"company_id",
					"company_title",
					"location",
				]);
				const ftsSchema = `fts_main_${viewName}`;
				// Group by field for FTS
				const byField = groups.reduce((acc, g) => {
					const key = g.field && fieldMap[g.field] ? fieldMap[g.field] : "__generic";
					(acc[key] ||= []).push(this._escapeLikeTerm(g.term));
					return acc;
				}, {});
				const scoreCols = [];
				const selectScores = Object.entries(byField)
					.map(([key, terms], i) => {
						const fieldsArg = key !== "__generic" ? `, fields := '${key}'` : "";
						const conjArg = `, conjunctive := ${op === 'OR' ? 0 : 1}`;
						const qstr = terms.join(" ");
						const col = `score_${i+1}`;
						scoreCols.push(col);
						return `${ftsSchema}.match_bm25(url, '${qstr}'${fieldsArg}${conjArg}) AS ${col}`;
					})
					.join(",\n\t\t\t\t\t\t");
				const whereScores = scoreCols.map((c) => `${c} IS NOT NULL`).join(op === 'OR' ? ' OR ' : ' AND ');
				const orderExpr = scoreCols.map((c) => `COALESCE(${c}, 0)`).join(" + ");
				const ftsSql = `
					SELECT * FROM (
						SELECT j.*,\n\t\t\t\t\t\t${selectScores}
						FROM ${viewName} j
					) sq
					WHERE ${whereScores}
					ORDER BY ${orderExpr} DESC
					LIMIT 100
				`;
				const ftsTable = await this.conn.query(ftsSql);
				const ftsRows = ftsTable.toArray();
				if (ftsRows.length) return this._rowsToPlain(ftsRows);
			} catch (e) {
				console.log("Jobs FTS search failed, falling back to LIKE:", e.message);
			}
		}

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
				SELECT 
					COUNT(*) AS total,
					CAST(CAST(published_date AS DATE) AS VARCHAR) AS date
				FROM '${jobsVname}' 
				WHERE CAST(published_date AS DATE) >= CURRENT_DATE - INTERVAL ${days} DAY
				  AND company_id = ?
				GROUP BY date
				ORDER BY date DESC
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
				SELECT 
					COUNT(*) AS total,
					CAST(CAST(published_date AS DATE) AS VARCHAR) AS date
				FROM '${jobsVname}' 
				WHERE CAST(published_date AS DATE) >= CURRENT_DATE - INTERVAL ${days} DAY
				GROUP BY date
				ORDER BY date DESC
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
