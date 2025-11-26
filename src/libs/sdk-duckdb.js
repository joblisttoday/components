/**
 * DuckDB WASM SDK for querying remote parquet data
 * @module sdk-duckdb
 */

import * as duckdb from "@duckdb/duckdb-wasm";
import { generateMissingDates } from "../utils/heatmap.js";

/**
 * SDK for querying DuckDB parquet data via WASM
 * @class JoblistDuckDBSDK
 */
export class JoblistDuckDBSDK {
	constructor(baseParquetUrl = "https://workers.joblist.today", options = {}) {
		this.baseParquetUrl = baseParquetUrl.replace(/\/$/, "");
		this.mode = "buffer"; // Use buffer mode for reliability like working version
		this.db = null;
		this.conn = null;
		this._registered = new Set();
		// Enable FTS by default for better search
		this.enableFTS = options.enableFTS !== false; // Default to true unless explicitly disabled
		this.ftsEnabled = false;
		this._columnsCache = new Map();
	}

	async initialize() {
		if (this.db) return; // already initialized

		console.log("🔧 Initializing DuckDB...");

		const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

		// Select a bundle based on browser checks
		const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

		const worker_url = URL.createObjectURL(
			new Blob([`importScripts("${bundle.mainWorker}");`], {
				type: "text/javascript",
			}),
		);

		// Instantiate the asynchronus version of DuckDB-Wasm
		const worker = new Worker(worker_url);
		const logger = new duckdb.ConsoleLogger();
		const db = new duckdb.AsyncDuckDB(logger, worker);
		await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

		const conn = await db.connect();

		// Use same HTTP configuration as working version
		try {
			await conn.query(
				"INSTALL httpfs; LOAD httpfs; SET enable_http_metadata_cache=true; SET http_metadata_cache_size=10485760; SET enable_object_cache=true;",
			);
			console.log("✅ httpfs loaded successfully");
		} catch (e) {
			console.log("⚠️ httpfs configuration:", e.message);
		}

		// Optionally enable FTS; off by default to avoid browser WASM issues
		if (this.enableFTS) {
			try {
				await conn.query("INSTALL fts; LOAD fts;");
				this.ftsEnabled = true;
				console.log("✅ FTS extension loaded");
			} catch (e) {
				this.ftsEnabled = false;
				console.log("ℹ️ FTS extension not available:", e.message);
			}
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

	async _getColumnsForVName(vname) {
		const key = `cols:${vname}`;
		if (this._columnsCache.has(key)) return this._columnsCache.get(key);
		const table = await this.conn.query(`SELECT * FROM '${vname}' LIMIT 0`);
		const cols = table.schema.fields.map((f) => f.name);
		this._columnsCache.set(key, cols);
		return cols;
	}

	async getColumns(base) {
		const vname = `${base}.parquet`;
		const url = this.parquetUrl(base);
		await this.ensureParquetRegistered(vname, url);
		return await this._getColumnsForVName(vname);
	}

	async ensureViewForParquet(viewName, vname) {
		// Create a stable view name for FTS to target; safe if it already exists
		try {
			await this.conn.query(
				`CREATE VIEW IF NOT EXISTS ${viewName} AS SELECT * FROM '${vname}'`,
			);
			return true;
		} catch (e) {
			console.log(`Failed to create view ${viewName}:`, e.message);
			return false;
		}
	}

	async createFTSIndex(viewName, idColumn, fields = []) {
		if (!this.ftsEnabled) return false;
		try {
			const cols =
				fields && fields.length
					? ", " + fields.map((c) => `'${c}'`).join(", ")
					: ", '*'"; // index all VARCHAR columns if fields omitted
			await this.conn.query(
				`PRAGMA create_fts_index('${viewName}', '${idColumn}'${cols})`,
			);
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
		return table
			.toArray()
			.map((row) =>
				Object.fromEntries(
					table.schema.fields.map((field, i) => [field.name, row[i]]),
				),
			);
	}

	// Enhanced search parsing - treat spaces as AND operations like GitHub search
	_parseSimpleSearch(query = "") {
		const q = String(query || "").trim();
		if (!q) return { terms: [] };

		// Split by spaces to get individual terms
		const tokens = q.split(/\s+/);
		const fieldValuePairs = [];
		const plainTextTerms = [];

		// Parse each token
		for (const token of tokens) {
			const fieldMatch = token.match(/^([a-zA-Z_][a-zA-Z0-9_]*):(.+)$/);
			if (fieldMatch) {
				fieldValuePairs.push({
					field: fieldMatch[1].toLowerCase(),
					value: fieldMatch[2],
				});
			} else if (token.trim()) {
				plainTextTerms.push(token.trim());
			}
		}

		// Determine search type
		if (fieldValuePairs.length > 1) {
			// Multiple field:value pairs (e.g., "tags:hardware tags:music")
			return {
				isMultiField: true,
				fieldValuePairs,
				plainTextTerms,
				conjunctive: 1, // Always treat as AND
			};
		} else if (fieldValuePairs.length === 1 && plainTextTerms.length > 0) {
			// Mixed search: field:value and plain text (e.g., "company:spacex freelance")
			return {
				isMixed: true,
				fieldValuePairs,
				plainTextTerms,
				conjunctive: 1,
			};
		} else if (fieldValuePairs.length === 1) {
			// Single field-specific search (e.g., "tags:python")
			return {
				field: fieldValuePairs[0].field,
				term: fieldValuePairs[0].value,
				conjunctive: 0,
			};
		} else if (plainTextTerms.length > 1) {
			// Multiple plain text terms (e.g., "python django")
			return {
				isPlainTextMulti: true,
				plainTextTerms,
				conjunctive: 1,
			};
		} else {
			// Single plain text term
			return {
				term: plainTextTerms[0] || q,
				conjunctive: 0,
			};
		}
	}

	_escapeSql(s = "") {
		return String(s).replace(/'/g, "''");
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
	async searchCompanies(query = "", limit = 100) {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "companies.parquet";
		const url = this.parquetUrl("companies");
		await this.ensureParquetRegistered(vname, url);

		if (!query.trim()) {
			return await this.getCompaniesHighlighted();
		}

		// Try FTS search first, fallback to LIKE search
		return await this._searchWithFallback(vname, "companies", query, limit, [
			"id",
			"title",
			"description",
			"tags",
		]);
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

	async searchJobs(query = "", limit = 100) {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "jobs.parquet";
		const url = this.parquetUrl("jobs");

		try {
			await this.ensureParquetRegistered(vname, url);
		} catch (e) {
			console.log("Jobs parquet file not found:", e.message);
			return [];
		}

		if (!query.trim()) {
			return await this.getJobsFromHighlightedCompanies();
		}

		// Handle field aliases for jobs
		const processedQuery = this._processJobsQuery(query);

		// Try FTS search first, fallback to LIKE search
		return await this._searchWithFallback(
			vname,
			"jobs",
			processedQuery,
			limit,
			["name", "company_title", "location", "company_id"],
		);
	}

	async getJobsFromHighlightedCompanies(limit = 100) {
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
            ${Number(limit) > 0 ? `LIMIT ${Number(limit)}` : ""}
        `;

		try {
			const table = await this.conn.query(sql);
			return this._rowsToPlain(table.toArray());
		} catch (error) {
			console.log(
				"Jobs parquet file not found or failed to load:",
				error.message,
			);
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

		// Prefer dedicated stats parquet if available
		try {
			const statsVName = "stats.parquet";
			const statsUrl = this.parquetUrl("stats");
			await this.ensureParquetRegistered(statsVName, statsUrl);
			const table = await this.conn.query(`SELECT * FROM '${statsVName}' LIMIT 1`);
			const rows = this._rowsToPlain(table.toArray());
			if (rows?.length) return rows[0];
		} catch (e) {
			console.log("Failed to load stats parquet, falling back:", e.message);
		}

		// Fallback: compute counts directly from base tables
		let total_companies = 0;
		let total_jobs = 0;

		try {
			const companiesVName = "companies.parquet";
			const companiesUrl = this.parquetUrl("companies");
			await this.ensureParquetRegistered(companiesVName, companiesUrl);
			const companyQuery = await this.conn.query(
				`SELECT COUNT(*) as count FROM '${companiesVName}'`,
			);
			const companyRows = companyQuery.toArray();
			total_companies = Number(companyRows[0]?.count ?? 0);
		} catch (e) {
			console.log("Failed to get company count:", e.message);
		}

		try {
			const jobsVName = "jobs.parquet";
			const jobsUrl = this.parquetUrl("jobs");
			await this.ensureParquetRegistered(jobsVName, jobsUrl);
			const jobsQuery = await this.conn.query(
				`SELECT COUNT(*) as count FROM '${jobsVName}'`,
			);
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
			console.log(
				"Failed to join companies with jobs, returning all companies:",
				e.message,
			);
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

	// FTS search with fallback to LIKE
	async _searchWithFallback(vname, tableName, query, limit, searchColumns) {
		const parsed = this._parseSimpleSearch(query);
		const {
			field,
			term,
			isMultiField,
			isMixed,
			isPlainTextMulti,
			fieldValuePairs,
			plainTextTerms,
		} = parsed;
		const limitClause = Number(limit) > 0 ? ` LIMIT ${Number(limit)}` : "";

		console.log(`🔍 Parsed search query: "${query}"`, parsed);

		// Handle multiple field:value pairs (e.g., "tags:hardware tags:music")
		if (isMultiField) {
			return await this._multiFieldSearch(
				vname,
				fieldValuePairs,
				plainTextTerms,
				limitClause,
				searchColumns,
			);
		}

		// Handle mixed field:value and plain text (e.g., "company:spacex freelance")
		if (isMixed) {
			return await this._mixedFieldSearch(
				vname,
				fieldValuePairs,
				plainTextTerms,
				limitClause,
				searchColumns,
			);
		}

		// Handle multiple plain text terms (e.g., "python django")
		if (isPlainTextMulti) {
			return await this._plainTextMultiSearch(
				vname,
				plainTextTerms,
				limitClause,
				searchColumns,
			);
		}

		// Validate single field exists in this table's columns
		if (field && !searchColumns.includes(field)) {
			console.log(
				`Field '${field}' not available in ${tableName}, available: ${searchColumns.join(", ")}`,
			);
			return []; // Return empty results for invalid field
		}

		// Try FTS search first if available and no field-specific search
		if (this.ftsEnabled && !field && term) {
			try {
				return await this._ftsSearch(vname, tableName, term, limit);
			} catch (e) {
				// Fall back to LIKE search if FTS fails
				console.log(
					`FTS search failed for ${tableName}, falling back to LIKE:`,
					e.message,
				);
			}
		}

		// Fallback to LIKE search
		return await this._likeSearch(
			vname,
			field,
			term,
			limitClause,
			searchColumns,
		);
	}

	async _ftsSearch(vname, tableName, query, limit) {
		const viewName = `fts_${tableName}`;
		const limitClause = Number(limit) > 0 ? ` LIMIT ${Number(limit)}` : "";

		// Create view with rowid for FTS
		try {
			await this.conn.query(`DROP VIEW IF EXISTS ${viewName}`);
			await this.conn.query(
				`CREATE VIEW ${viewName} AS SELECT ROW_NUMBER() OVER() as rowid, * FROM '${vname}'`,
			);
		} catch (e) {
			console.log(`Failed to create FTS view: ${e.message}`);
			throw e;
		}

		// Try to create FTS index (will fail silently if already exists)
		await this.createFTSIndex(viewName, "id");

		// Parse query for boolean operations
		const { term, conjunctive, field } = this._parseSimpleSearch(query);
		const escapedQuery = this._escapeSql(term);

		// Build FTS query with boolean support
		const fieldsParam = field ? `fields := '${field}', ` : "";
		const conjunctiveParam = conjunctive ? "conjunctive := 1, " : "";

		const sql = `
			SELECT v.*, score
			FROM (
				SELECT *, fts_main_${viewName}.match_bm25(
					id,
					'${escapedQuery}',
					${fieldsParam}${conjunctiveParam}k := 1.2, b := 0.75
				) AS score
				FROM ${viewName}
			) v
			WHERE v.score IS NOT NULL
			ORDER BY v.score DESC${limitClause}
		`;

		const table = await this.conn.query(sql);
		return this._rowsToPlain(table.toArray());
	}

	async _likeSearch(vname, field, term, limitClause, searchColumns) {
		const escapedTerm = this._escapeSql(term.toLowerCase());

		let sql;
		if (field && term) {
			// Field-specific search: field:value (field already validated)
			sql = `SELECT * FROM '${vname}' WHERE lower(cast(${field} AS varchar)) LIKE '%${escapedTerm}%'${limitClause}`;
		} else {
			// General search across specified columns
			const conditions = searchColumns.map(
				(col) => `lower(cast(${col} AS varchar)) LIKE '%${escapedTerm}%'`,
			);
			sql = `SELECT * FROM '${vname}' WHERE (${conditions.join(" OR ")})${limitClause}`;
		}

		try {
			const table = await this.conn.query(sql);
			return this._rowsToPlain(table.toArray());
		} catch (e) {
			console.log(`LIKE search failed: ${e.message}`);
			return [];
		}
	}

	// Handle mixed field:value and plain text searches like "company:spacex freelance"
	async _mixedFieldSearch(
		vname,
		fieldValuePairs,
		plainTextTerms,
		limitClause,
		searchColumns,
	) {
		console.log(`🔍 Mixed search in table with columns:`, searchColumns);
		console.log(`🎯 Field:value pairs:`, fieldValuePairs);
		console.log(`📝 Plain text terms:`, plainTextTerms);

		const fieldConditions = [];
		const plainTextConditions = [];

		// Process field:value pairs
		for (const { field, value } of fieldValuePairs) {
			if (searchColumns.includes(field)) {
				const escapedValue = this._escapeSql(value.toLowerCase());
				fieldConditions.push(
					`lower(cast(${field} AS varchar)) LIKE '%${escapedValue}%'`,
				);
				console.log(`✅ Field '${field}' is valid`);
			} else {
				console.log(
					`❌ Field '${field}' not found in available columns: ${searchColumns.join(", ")}`,
				);
			}
		}

		// Process plain text terms - each term must match at least one column
		for (const term of plainTextTerms) {
			if (term.trim()) {
				const escapedTerm = this._escapeSql(term.toLowerCase());
				const termCondition = searchColumns
					.map(
						(col) => `lower(cast(${col} AS varchar)) LIKE '%${escapedTerm}%'`,
					)
					.join(" OR ");
				plainTextConditions.push(`(${termCondition})`);
			}
		}

		// Combine all conditions with AND
		const allConditions = [...fieldConditions, ...plainTextConditions];
		if (allConditions.length === 0) {
			console.log("❌ No valid conditions found");
			return [];
		}

		const sql = `SELECT * FROM '${vname}' WHERE ${allConditions.join(" AND ")}${limitClause}`;
		console.log(`🔧 Generated mixed search SQL: ${sql}`);

		try {
			const table = await this.conn.query(sql);
			const results = this._rowsToPlain(table.toArray());
			console.log(`✅ Mixed search returned ${results.length} results`);
			return results;
		} catch (e) {
			console.log(`❌ Mixed search failed: ${e.message}`);
			return [];
		}
	}

	// Handle multi-field searches like "tags:hardware tags:music"
	async _multiFieldSearch(
		vname,
		fieldValuePairs,
		plainTextTerms,
		limitClause,
		searchColumns,
	) {
		console.log(`🔍 Multi-field search in table with columns:`, searchColumns);
		console.log(`🎯 Field:value pairs:`, fieldValuePairs);
		console.log(`📝 Plain text terms:`, plainTextTerms);

		const fieldConditions = [];
		const plainTextConditions = [];

		// Process field:value pairs
		for (const { field, value } of fieldValuePairs) {
			if (searchColumns.includes(field)) {
				const escapedValue = this._escapeSql(value.toLowerCase());
				fieldConditions.push(
					`lower(cast(${field} AS varchar)) LIKE '%${escapedValue}%'`,
				);
				console.log(`✅ Field '${field}' is valid`);
			} else {
				console.log(
					`❌ Field '${field}' not found in available columns: ${searchColumns.join(", ")}`,
				);
			}
		}

		// Process any additional plain text terms
		for (const term of plainTextTerms) {
			if (term.trim()) {
				const escapedTerm = this._escapeSql(term.toLowerCase());
				const termCondition = searchColumns
					.map(
						(col) => `lower(cast(${col} AS varchar)) LIKE '%${escapedTerm}%'`,
					)
					.join(" OR ");
				plainTextConditions.push(`(${termCondition})`);
			}
		}

		// Combine all conditions with AND
		const allConditions = [...fieldConditions, ...plainTextConditions];
		if (allConditions.length === 0) {
			console.log("❌ No valid conditions found");
			return [];
		}

		const sql = `SELECT * FROM '${vname}' WHERE ${allConditions.join(" AND ")}${limitClause}`;
		console.log(`🔧 Generated multi-field search SQL: ${sql}`);

		try {
			const table = await this.conn.query(sql);
			const results = this._rowsToPlain(table.toArray());
			console.log(`✅ Multi-field search returned ${results.length} results`);
			return results;
		} catch (e) {
			console.log(`❌ Multi-field search failed: ${e.message}`);
			return [];
		}
	}

	// Handle multiple plain text terms like "python django"
	async _plainTextMultiSearch(
		vname,
		plainTextTerms,
		limitClause,
		searchColumns,
	) {
		console.log(
			`🔍 Plain text multi search: ${plainTextTerms.join(" ")} in table with columns:`,
			searchColumns,
		);

		// Each term must match at least one column (AND logic)
		const termConditions = plainTextTerms.map((term) => {
			const escapedTerm = this._escapeSql(term.toLowerCase());
			const columnMatches = searchColumns.map(
				(col) => `lower(cast(${col} AS varchar)) LIKE '%${escapedTerm}%'`,
			);
			return `(${columnMatches.join(" OR ")})`;
		});

		const sql = `SELECT * FROM '${vname}' WHERE ${termConditions.join(" AND ")}${limitClause}`;
		console.log(`🔧 Generated plain text multi search SQL: ${sql}`);

		try {
			const table = await this.conn.query(sql);
			const results = this._rowsToPlain(table.toArray());
			console.log(
				`✅ Plain text multi search returned ${results.length} results`,
			);
			return results;
		} catch (e) {
			console.log(`❌ Plain text multi search failed: ${e.message}`);
			return [];
		}
	}

	// Process jobs query to handle field aliases
	_processJobsQuery(query) {
		// Field aliases for jobs
		const fieldMap = {
			company: "company_title",
			id: "company_id",
			title: "name", // job title maps to name column
		};

		// Replace field aliases in query
		let processedQuery = query;
		for (const [alias, actual] of Object.entries(fieldMap)) {
			const regex = new RegExp(`\\b${alias}:`, "gi");
			processedQuery = processedQuery.replace(regex, `${actual}:`);
		}

		return processedQuery;
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
