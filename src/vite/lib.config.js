// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import { existsSync } from "fs";

export default defineConfig({
	appType: "mpa",
	base: "./",
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.js"),
			formats: ["es"],
			name: "index",
			fileName: "index",
		},
		rollupOptions: {
			output: {
				dir: "dist-lib",
			},
		},
	},
	optimizeDeps: {
		exclude: ['@sqlite.org/sqlite-wasm'],
	},
});
