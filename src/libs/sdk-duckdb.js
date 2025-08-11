import * as duckdb from "@duckdb/duckdb-wasm";
// Vite-friendly asset URLs for worker/wasm bundles
// import duckdb_wasm_mvp from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
// import duckdb_worker_mvp from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import duckdb_worker_eh from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";

export class JoblistDuckDBSDK {
	constructor(baseParquetUrl = "https://workers.joblist.today", options = {}) {
		this.baseParquetUrl = baseParquetUrl.replace(/\/$/, "");
		this.mode = options.mode === "auto" ? "auto" : "buffer"; // default buffer for reliability
		this.db = null;
		this.conn = null;
		this._registered = new Set();
		this._ftsIndexes = new Set();
		this.ftsEnabled = false;
	}

	async initialize() {
		if (this.db) return; // idempotent

		const MANUAL_BUNDLES = {
			// mvp: { mainModule: duckdb_wasm_mvp, mainWorker: duckdb_worker_mvp },
			eh: { mainModule: duckdb_wasm_eh, mainWorker: duckdb_worker_eh },
		};
		const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
		const worker = new Worker(bundle.mainWorker);
		const logger = new duckdb.ConsoleLogger();
		const db = new duckdb.AsyncDuckDB(logger, worker);
		await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

		const conn = await db.connect();
		// Ensure httpfs is available and enable metadata caching for efficient remote reads
		try {
			await conn.query(
				"INSTALL httpfs; LOAD httpfs; SET enable_http_metadata_cache=true; SET http_metadata_cache_size=10485760; SET enable_object_cache=true;",
			);
		} catch (_) {
			// Some builds have httpfs preloaded; ignore errors
		}

		// Install and load Full-Text Search extension
		try {
			await conn.query("INSTALL fts; LOAD fts;");
			this.ftsEnabled = true;
			console.log("FTS extension loaded successfully");
		} catch (e) {
			console.log(
				"FTS extension not available, falling back to LIKE search:",
				e.message,
			);
			this.ftsEnabled = false;
		}

		this.db = db;
		this.conn = conn;

		// Bulk register all known parquet files
		await this.registerAllParquetFiles();
	}

	async dispose() {
		try {
			if (this.conn) await this.conn.close();
		} finally {
			this.conn = null;
			this.db = null;
		}
	}

	async registerAllParquetFiles() {
		// List of all known parquet files in the system
		const parquetFiles = [
			"companies",
			"companies_fts", 
			"jobs",
			"jobs_fts"
		];

		console.log("🗃️ Bulk registering parquet files via URL (HTTP range requests)...");
		const registrationPromises = parquetFiles.map(async (tableName) => {
			const vname = `${tableName}.parquet`;
			const url = this.parquetUrl(tableName);
			
			try {
				// Use URL registration for HTTP range requests instead of downloading entire files
				await this.registerUrlAsFile(vname, url);
				this._registered.add(vname);
				console.log(`✅ Registered ${vname} (HTTP range requests enabled)`);
				return { tableName, success: true, method: 'url' };
			} catch (error) {
				console.log(`⚠️ Failed to register ${vname}: ${error.message}`);
				return { tableName, success: false, error: error.message };
			}
		});

		const results = await Promise.allSettled(registrationPromises);
		const successful = results.filter(r => r.status === "fulfilled" && r.value.success).length;
		const failed = results.filter(r => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)).length;
		
		console.log(`🗃️ Parquet registration complete: ${successful} successful, ${failed} failed`);
		console.log("📡 All successful registrations use HTTP range requests - only queried data is transferred");
		
		return {
			successful,
			failed,
			results: results.map(r => r.status === "fulfilled" ? r.value : { error: r.reason })
		};
	}

	// Helper method to execute queries with simplified error handling since files are pre-registered
	async executeQuery(sql, fallbackRegistrationCallback = null) {
		try {
			return await this.conn.query(sql);
		} catch (error) {
			// If query fails and we have a fallback registration callback, try it once
			if (fallbackRegistrationCallback) {
				console.log("Query failed, attempting fallback registration:", error.message);
				try {
					await fallbackRegistrationCallback();
					return await this.conn.query(sql);
				} catch (fallbackError) {
					console.log("Fallback registration also failed:", fallbackError.message);
					throw error; // throw original error
				}
			}
			throw error;
		}
	}

	parquetUrl(tableName) {
		const safe = String(tableName).replace(/[^A-Za-z0-9_-]/g, "");
		return `${this.baseParquetUrl}/${safe}.parquet`;
	}

	async registerUrlAsFile(name, url) {
		// Register a remote URL under a stable virtual filename.
		// Subsequent SQL can refer to the file by name without hitting URL parsing edge-cases.
		await this.db.registerFileURL(
			name,
			url,
			duckdb.DuckDBDataProtocol.HTTP,
			false,
		);
		return name;
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
		if (this.mode === "buffer") {
			await this.fetchAndRegister(vname, url);
		} else {
			// auto: try URL-backed first, then buffer
			try {
				await this.registerUrlAsFile(vname, url);
				this._registered.add(vname);
				return vname;
			} catch (_) {
				await this.fetchAndRegister(vname, url);
			}
		}
		return vname;
	}

	async createFTSIndex(tableName, indexName, columns) {
		if (!this.ftsEnabled || this._ftsIndexes.has(indexName)) return false;

		try {
			const columnList = Array.isArray(columns) ? columns.join(", ") : columns;
			const sql = `CREATE INDEX ${indexName} ON ${tableName} USING FTS(${columnList})`;
			console.log("Creating FTS index:", sql);
			await this.conn.query(sql);
			this._ftsIndexes.add(indexName);
			console.log(`FTS index ${indexName} created successfully`);
			return true;
		} catch (e) {
			console.log(`Failed to create FTS index ${indexName}:`, e.message);
			return false;
		}
	}

	async countRows(tableName) {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const url = this.parquetUrl(tableName);
		const vname = `${tableName}.parquet`;
		let q;
		try {
			await this.registerUrlAsFile(vname, url);
			q = await this.conn.query(
				`SELECT COUNT(*)::BIGINT AS cnt FROM '${vname.replace(/'/g, "''")}'`,
			);
		} catch (e) {
			await this.fetchAndRegister(vname, url);
			q = await this.conn.query(
				`SELECT COUNT(*)::BIGINT AS cnt FROM '${vname.replace(/'/g, "''")}'`,
			);
		}
		const rows = q.toArray();
		return Number(rows[0]?.cnt ?? 0);
	}

	async getStats() {
		if (!this.conn) throw new Error("DuckDB not initialized");

		let total_companies = 0;
		let total_jobs = 0;

		// Try to get company count
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

		// Try to get jobs count
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
			console.log(
				"Jobs parquet file might not exist at:",
				this.parquetUrl("jobs"),
			);
		}

		return {
			total_companies,
			total_jobs,
		};
	}

	// Companies API (from companies.parquet)
	async getCompanies() {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "companies.parquet";
		const url = this.parquetUrl("companies");
		await this.ensureParquetRegistered(vname, url);
		let table;
		try {
			table = await this.conn.query(`SELECT * FROM '${vname}'`);
		} catch (e) {
			await this.fetchAndRegister(vname, url);
			table = await this.conn.query(`SELECT * FROM '${vname}'`);
		}
		return this._rowsToPlain(table.toArray());
	}

	async getCompaniesHighlighted() {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "companies.parquet";
		const sql = `SELECT * FROM '${vname}' WHERE is_highlighted = true OR is_highlighted = 1 OR lower(cast(is_highlighted as varchar)) = 'true'`;
		
		const table = await this.executeQuery(sql, async () => {
			// Fallback registration if needed - prefer URL registration for HTTP range requests
			const url = this.parquetUrl("companies");
			try {
				await this.registerUrlAsFile(vname, url);
				this._registered.add(vname);
			} catch (e) {
				// Only fall back to full download if URL registration fails
				await this.fetchAndRegister(vname, url);
			}
		});
		
		return this._rowsToPlain(table.toArray());
	}

	async getJobsFromHighlightedCompanies() {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const companiesVname = "companies.parquet";
		const jobsVname = "jobs.parquet";
		
		const sql = `
			SELECT j.* FROM '${jobsVname}' j
			INNER JOIN '${companiesVname}' c ON j.company_id = c.id
			WHERE c.is_highlighted = true OR c.is_highlighted = 1 OR lower(cast(c.is_highlighted as varchar)) = 'true'
			LIMIT 100
		`;
		
		try {
			const table = await this.executeQuery(sql, async () => {
				// Fallback registration if needed - prefer URL registration for HTTP range requests
				const companiesUrl = this.parquetUrl("companies");
				const jobsUrl = this.parquetUrl("jobs");
				
				try {
					await this.registerUrlAsFile(companiesVname, companiesUrl);
					this._registered.add(companiesVname);
				} catch (e) {
					await this.fetchAndRegister(companiesVname, companiesUrl);
				}
				
				try {
					await this.registerUrlAsFile(jobsVname, jobsUrl);
					this._registered.add(jobsVname);
				} catch (e) {
					await this.fetchAndRegister(jobsVname, jobsUrl);
				}
			});
			
			return this._rowsToPlain(table.toArray());
		} catch (error) {
			console.log("Jobs parquet file not found or failed to load:", error.message);
			return []; // Return empty array if jobs file doesn't exist
		}
	}

	async getCompany(id) {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "companies.parquet";
		const url = this.parquetUrl("companies");
		await this.ensureParquetRegistered(vname, url);
		const lit = String(id).replace(/'/g, "''");
		const sql = `SELECT * FROM '${vname}' WHERE id = '${lit}' LIMIT 1`;
		let table;
		try {
			table = await this.conn.query(sql);
		} catch (e) {
			await this.fetchAndRegister(vname, url);
			table = await this.conn.query(sql);
		}
		const rows = this._rowsToPlain(table.toArray());
		return rows[0] || null;
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

	// Schema inspection helper
	async getTableSchema(tableName) {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = `${tableName}.parquet`;
		const url = this.parquetUrl(tableName);
		await this.ensureParquetRegistered(vname, url);

		let table;
		try {
			table = await this.conn.query(`DESCRIBE '${vname}'`);
		} catch (e) {
			await this.fetchAndRegister(vname, url);
			table = await this.conn.query(`DESCRIBE '${vname}'`);
		}
		return this._rowsToPlain(table.toArray());
	}

	// Parse field-specific search syntax like "tags:searchterm"
	_parseFieldSearch(query) {
		const fieldMatch = query.match(/^(\w+):(.*?)$/);
		if (fieldMatch) {
			return {
				field: fieldMatch[1],
				term: fieldMatch[2].trim()
			};
		}
		return { field: null, term: query };
	}

	// Search functionality - uses DuckDB FTS if available, falls back to LIKE search
	async searchCompanies(query = "") {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "companies.parquet";
		const ftsVname = "companies_fts.parquet";
		const url = this.parquetUrl("companies");
		const ftsUrl = this.parquetUrl("companies_fts");
		
		await this.ensureParquetRegistered(vname, url);

		if (!query || query.trim() === "") {
			// If no query, return sample companies
			console.log("No search query, returning sample companies");
			const sql = `SELECT * FROM '${vname}' LIMIT 100`;
			let table;
			try {
				table = await this.conn.query(sql);
			} catch (e) {
				await this.fetchAndRegister(vname, url);
				table = await this.conn.query(sql);
			}
			const results = this._rowsToPlain(table.toArray());
			console.log("Found", results.length, "companies");
			return results;
		}

		console.log("Searching companies for:", query);
		const { field, term } = this._parseFieldSearch(query);
		console.log("Parsed search:", { field, term });

		// Try FTS first if available and we have pre-built FTS data
		if (this.ftsEnabled) {
			try {
				// Try to load the pre-built FTS parquet file
				await this.ensureParquetRegistered(ftsVname, ftsUrl);
				
				const ftsQuery = term.trim().replace(/'/g, "''");
				let ftsSql;
				
				if (field) {
					// Field-specific search using the fields parameter
					ftsSql = `
						SELECT c.*, f.score 
						FROM '${ftsVname}' f
						JOIN '${vname}' c ON f.id = c.id
						WHERE fts_main_companies.match_bm25(f.id, '${ftsQuery}', fields := '${field}')
						ORDER BY f.score DESC
						LIMIT 100
					`;
				} else {
					// Search all indexed fields
					ftsSql = `
						SELECT c.*, f.score 
						FROM '${ftsVname}' f
						JOIN '${vname}' c ON f.id = c.id
						WHERE fts_main_companies.match_bm25(f.id, '${ftsQuery}')
						ORDER BY f.score DESC
						LIMIT 100
					`;
				}

				console.log("Trying FTS search:", ftsSql);
				const ftsTable = await this.conn.query(ftsSql);
				const ftsResults = this._rowsToPlain(ftsTable.toArray());

				if (ftsResults.length > 0) {
					console.log("FTS search found", ftsResults.length, "companies");
					return ftsResults;
				}
			} catch (e) {
				console.log(
					"FTS search failed (FTS parquet may not exist), falling back to LIKE search:",
					e.message,
				);
			}
		}

		// Fallback to LIKE search
		const searchQuery = term.toLowerCase().trim();
		let likeSql;
		
		if (field) {
			// Field-specific LIKE search
			if (field === 'tags') {
				likeSql = `
					SELECT * FROM '${vname}'
					WHERE lower(cast(tags as varchar)) LIKE '%${searchQuery.replace(/'/g, "''")}%'
					LIMIT 100
				`;
			} else if (field === 'title') {
				likeSql = `
					SELECT * FROM '${vname}'
					WHERE lower(title) LIKE '%${searchQuery.replace(/'/g, "''")}%'
					LIMIT 100
				`;
			} else {
				// Generic field search
				likeSql = `
					SELECT * FROM '${vname}'
					WHERE lower(cast(${field} as varchar)) LIKE '%${searchQuery.replace(/'/g, "''")}%'
					LIMIT 100
				`;
			}
		} else {
			// Search across all fields
			likeSql = `
				SELECT * FROM '${vname}'
				WHERE lower(id) LIKE '%${searchQuery.replace(/'/g, "''")}%'
				   OR lower(title) LIKE '%${searchQuery.replace(/'/g, "''")}%'
				   OR lower(cast(tags as varchar)) LIKE '%${searchQuery.replace(/'/g, "''")}%'
				LIMIT 100
			`;
		}

		console.log("Using LIKE search:", likeSql);

		let table;
		try {
			table = await this.conn.query(likeSql);
		} catch (e) {
			console.log("LIKE search failed, trying to re-register:", e.message);
			await this.fetchAndRegister(vname, url);
			table = await this.conn.query(likeSql);
		}

		const results = this._rowsToPlain(table.toArray());
		console.log("LIKE search found", results.length, "companies");
		return results;
	}

	async searchJobs(query = "") {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "jobs.parquet";
		const ftsVname = "jobs_fts.parquet";
		const url = this.parquetUrl("jobs");
		const ftsUrl = this.parquetUrl("jobs_fts");

		console.log("Searching jobs for:", query, "at URL:", url);

		try {
			await this.ensureParquetRegistered(vname, url);
		} catch (e) {
			console.log("Jobs parquet file not found or failed to load:", e.message);
			console.log("This is expected if jobs.parquet doesn't exist yet");
			return []; // Return empty array if jobs file doesn't exist
		}

		// If no query, return sample jobs
		if (!query || query.trim() === "") {
			console.log("No search query, returning sample jobs");
			const sql = `SELECT * FROM '${vname}' LIMIT 50`;
			let table;
			try {
				table = await this.conn.query(sql);
				const results = this._rowsToPlain(table.toArray());
				console.log("Found", results.length, "jobs");
				return results;
			} catch (e) {
				console.log("Failed to query jobs:", e.message);
				return [];
			}
		}

		console.log("Attempting search in jobs parquet");
		const { field, term } = this._parseFieldSearch(query);
		console.log("Parsed search:", { field, term });

		// Try FTS first if available and we have pre-built FTS data
		if (this.ftsEnabled) {
			try {
				// Try to load the pre-built FTS parquet file
				await this.ensureParquetRegistered(ftsVname, ftsUrl);
				
				const ftsQuery = term.trim().replace(/'/g, "''");
				let ftsSql;
				
				if (field) {
					// Field-specific search using the fields parameter
					ftsSql = `
						SELECT j.*, f.score 
						FROM '${ftsVname}' f
						JOIN '${vname}' j ON f.id = j.id
						WHERE fts_main_jobs.match_bm25(f.id, '${ftsQuery}', fields := '${field}')
						ORDER BY f.score DESC
						LIMIT 100
					`;
				} else {
					// Search all indexed fields
					ftsSql = `
						SELECT j.*, f.score 
						FROM '${ftsVname}' f
						JOIN '${vname}' j ON f.id = j.id
						WHERE fts_main_jobs.match_bm25(f.id, '${ftsQuery}')
						ORDER BY f.score DESC
						LIMIT 100
					`;
				}

				console.log("Trying FTS search for jobs:", ftsSql);
				const ftsTable = await this.conn.query(ftsSql);
				const ftsResults = this._rowsToPlain(ftsTable.toArray());

				if (ftsResults.length > 0) {
					console.log("FTS search found", ftsResults.length, "jobs");
					return ftsResults;
				}
			} catch (e) {
				console.log(
					"FTS search for jobs failed (FTS parquet may not exist), falling back to LIKE search:",
					e.message,
				);
			}
		}

		// Fallback to LIKE search
		const searchQuery = term.toLowerCase().trim();
		let likeSql;
		
		if (field) {
			// Field-specific LIKE search
			if (field === 'name') {
				likeSql = `
					SELECT * FROM '${vname}'
					WHERE lower(name) LIKE '%${searchQuery.replace(/'/g, "''")}%'
					LIMIT 100
				`;
			} else if (field === 'location') {
				likeSql = `
					SELECT * FROM '${vname}'
					WHERE lower(location) LIKE '%${searchQuery.replace(/'/g, "''")}%'
					LIMIT 100
				`;
			} else if (field === 'company') {
				likeSql = `
					SELECT * FROM '${vname}'
					WHERE lower(company_id) LIKE '%${searchQuery.replace(/'/g, "''")}%'
					   OR lower(company_title) LIKE '%${searchQuery.replace(/'/g, "''")}%'
					LIMIT 100
				`;
			} else {
				// Generic field search
				likeSql = `
					SELECT * FROM '${vname}'
					WHERE lower(cast(${field} as varchar)) LIKE '%${searchQuery.replace(/'/g, "''")}%'
					LIMIT 100
				`;
			}
		} else {
			// Search across all fields
			likeSql = `
				SELECT * FROM '${vname}'
				WHERE lower(name) LIKE '%${searchQuery.replace(/'/g, "''")}%'
				   OR lower(company_id) LIKE '%${searchQuery.replace(/'/g, "''")}%'
				   OR lower(company_title) LIKE '%${searchQuery.replace(/'/g, "''")}%'
				   OR lower(location) LIKE '%${searchQuery.replace(/'/g, "''")}%'
				LIMIT 100
			`;
		}

		console.log("Jobs LIKE search SQL:", likeSql);

		try {
			const table = await this.conn.query(likeSql);
			const results = this._rowsToPlain(table.toArray());
			console.log("Jobs LIKE search found", results.length, "results");
			return results;
		} catch (e) {
			console.log("Jobs LIKE search failed:", e.message);

			// Even simpler fallback
			try {
				const simpleSql = `SELECT * FROM '${vname}' WHERE company_id LIKE '%${searchQuery}%' LIMIT 20`;
				console.log("Simple fallback search SQL:", simpleSql);
				const simpleTable = await this.conn.query(simpleSql);
				const simpleResults = this._rowsToPlain(simpleTable.toArray());
				console.log("Simple fallback found", simpleResults.length, "results");
				return simpleResults;
			} catch (e2) {
				console.log("Even simple fallback failed:", e2.message);
				return [];
			}
		}
	}

	async searchCompaniesByCoordinates(lat, lon, radius = 50) {
		// Temporarily disabled until we know the schema
		console.warn("Coordinate search not implemented - schema unknown");
		return [];
	}

	async searchJobsByCoordinates(lat, lon, radius = 50) {
		// Temporarily disabled until we know the schema
		console.warn("Job coordinate search not implemented - schema unknown");
		return [];
	}

	async getLastAddedCompanies(limit = 10) {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "companies.parquet";
		const url = this.parquetUrl("companies");
		await this.ensureParquetRegistered(vname, url);

		// Just return the first N companies for now (until we know the schema)
		const sql = `SELECT * FROM '${vname}' LIMIT ${limit}`;

		let table;
		try {
			table = await this.conn.query(sql);
		} catch (e) {
			await this.fetchAndRegister(vname, url);
			table = await this.conn.query(sql);
		}
		return this._rowsToPlain(table.toArray());
	}

	async getCompanyHeatmap(id, days = 365) {
		// Temporarily disabled until we know the schema
		console.warn("Company heatmap not implemented - schema unknown");
		return [];
	}

	async getJobsHeatmap(days = 365) {
		// Temporarily disabled until we know the schema
		console.warn("Jobs heatmap not implemented - schema unknown");
		return [];
	}

	async getAllCompaniesData() {
		return await this.getCompanies();
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

		// Try to join companies with jobs, but fall back to all companies if it fails
		try {
			const sql = `
        SELECT DISTINCT c.*
        FROM '${companiesVname}' c
        INNER JOIN '${jobsVname}' j ON c.id = j.company_id
      `;

			let table;
			try {
				table = await this.conn.query(sql);
			} catch (e) {
				await this.fetchAndRegister(companiesVname, companiesUrl);
				await this.fetchAndRegister(jobsVname, jobsUrl);
				table = await this.conn.query(sql);
			}
			return this._rowsToPlain(table.toArray());
		} catch (e) {
			console.log(
				"Failed to join companies with jobs, returning all companies:",
				e.message,
			);
			// If the join fails (e.g., no common columns), just return all companies
			return await this.getCompanies();
		}
	}

	async getAllJobsData() {
		if (!this.conn) throw new Error("DuckDB not initialized");
		const vname = "jobs.parquet";
		const url = this.parquetUrl("jobs");

		try {
			await this.ensureParquetRegistered(vname, url);
		} catch (e) {
			console.log("Jobs parquet file not found:", e.message);
			return []; // Return empty array if jobs file doesn't exist
		}

		let table;
		try {
			table = await this.conn.query(`SELECT * FROM '${vname}'`);
		} catch (e) {
			try {
				await this.fetchAndRegister(vname, url);
				table = await this.conn.query(`SELECT * FROM '${vname}'`);
			} catch (e2) {
				console.log("Failed to load jobs data:", e2.message);
				return []; // Return empty array instead of throwing
			}
		}
		return this._rowsToPlain(table.toArray());
	}

	async executeQuery(sql, params = []) {
		if (!this.conn) throw new Error("DuckDB not initialized");

		// Simple parameter substitution for DuckDB
		let processedSql = sql;
		params.forEach((param, index) => {
			const placeholder = new RegExp(`\\$${index + 1}|\\?`, "g");
			const escaped = String(param).replace(/'/g, "''");
			processedSql = processedSql.replace(placeholder, `'${escaped}'`);
		});

		const table = await this.conn.query(processedSql);
		return this._rowsToPlain(table.toArray());
	}
}

const joblistDuckDBSDK = new JoblistDuckDBSDK();
export default joblistDuckDBSDK;
