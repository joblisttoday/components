// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
	appType: "mpa",
	base: "./",
	build: {
		lib: {
			entry: resolve("src/index.js"),
			formats: ["es"],
			name: "index",
			fileName: "index",
		},
		rollupOptions: {
			external: (id, importer, isResolved) => {
				// Externalize ALL @duckdb/duckdb-wasm imports including ?url ones
				if (id.includes('@duckdb/duckdb-wasm')) {
					return true;
				}
				
				// Externalize other main package imports and their sub-paths
				const packages = [
					"@observablehq/plot",
					"@stripe/stripe-js", 
					"leaflet",
					"giscus",
					"dompurify",
					"date-fns",
					"@sctlib/mwc",
					"d3"
				];
				
				return packages.some(pkg => id === pkg || id.startsWith(pkg + '/'));
			},
			output: {
				dir: "dist-lib",
				// Generate separate chunks for assets
				assetFileNames: "assets/[name]-[hash][extname]",
				chunkFileNames: "chunks/[name]-[hash].js"
			},
		},
		// Copy WASM/worker assets to dist
		assetsDir: "assets",
		copyPublicDir: false,
		// Don't inline large assets - force them to be separate files
		assetsInlineLimit: 4096, // 4KB limit instead of 0 (0 might have issues)
	},
	optimizeDeps: {
		exclude: ["@sqlite.org/sqlite-wasm", "@duckdb/duckdb-wasm"],
	},
	// Force WASM files to be output as separate assets
	assetsInclude: ['**/*.wasm', '**/*.worker.js'],
});
