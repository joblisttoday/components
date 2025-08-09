import * as duckdb from "@duckdb/duckdb-wasm";
// Vite-friendly asset URLs for worker/wasm bundles
import duckdb_wasm_mvp from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import duckdb_worker_mvp from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import duckdb_worker_eh from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";

export class JoblistDuckDBSDK {
  constructor(baseParquetUrl = "https://workers.joblist.today", options = {}) {
    this.baseParquetUrl = baseParquetUrl.replace(/\/$/, "");
    this.mode = options.mode === "auto" ? "auto" : "buffer"; // default buffer for reliability
    this.db = null;
    this.conn = null;
    this._registered = new Set();
  }

	async initialize() {
		if (this.db) return; // idempotent

		const MANUAL_BUNDLES = {
			mvp: { mainModule: duckdb_wasm_mvp, mainWorker: duckdb_worker_mvp },
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

		this.db = db;
		this.conn = conn;
	}

  async dispose() {
		try {
			if (this.conn) await this.conn.close();
		} finally {
			this.conn = null;
			this.db = null;
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
		const companiesAnalyzeUrl = this.parquetUrl("companies_analyze");
		const jobsAnalyzeUrl = this.parquetUrl("jobs_analyze");
    const companiesVName = "companies_analyze.parquet";
    const jobsVName = "jobs_analyze.parquet";
    await this.ensureParquetRegistered(companiesVName, companiesAnalyzeUrl);
    await this.ensureParquetRegistered(jobsVName, jobsAnalyzeUrl);
    const q = await this.conn.query(
      `SELECT
       (SELECT total_companies FROM '${companiesVName}' LIMIT 1) AS total_companies,
       (SELECT total_jobs FROM '${jobsVName}' LIMIT 1) AS total_jobs`,
    );
    const rows = q.toArray();
    return {
      total_companies: Number(rows[0]?.total_companies ?? 0),
      total_jobs: Number(rows[0]?.total_jobs ?? 0),
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
    const url = this.parquetUrl("companies");
    await this.ensureParquetRegistered(vname, url);
    let table;
    const sql = `SELECT * FROM '${vname}' WHERE is_highlighted = true OR is_highlighted = 1 OR lower(cast(is_highlighted as varchar)) = 'true'`;
    try {
      table = await this.conn.query(sql);
    } catch (e) {
      await this.fetchAndRegister(vname, url);
      table = await this.conn.query(sql);
    }
    return this._rowsToPlain(table.toArray());
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
					out.tags = Array.isArray(p) ? p : (typeof p === "string" ? p.split(",").map(s=>s.trim()).filter(Boolean) : []);
				} catch {
					out.tags = out.tags.split(",").map((s) => s.trim()).filter(Boolean);
				}
			} else if (out.tags == null) {
				out.tags = [];
			}
			return out;
		  }
		  return val;
		};
		return rows.map(convert);
	  }
}

const joblistDuckDBSDK = new JoblistDuckDBSDK();
export default joblistDuckDBSDK;
