// vite.config.js
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";
import { defineConfig } from "vite";
import recursive from "recursive-readdir";

const BASE_URL = process.env.VITE_BASE || "/";

const generateExampleInputFiles = async () => {
	const entriesDir = resolve("./apps/");
	const entries = await recursive(entriesDir);
	const inputFiles = entries
		.filter((entry) => entry.endsWith(".html"))
		.reduce((acc, entry) => {
			const inputFilePath = entry.replace(__dirname + "/", "");
			const inputName = inputFilePath.replace(".html", "").split("/").join("_");
			acc[inputName] = inputFilePath;
			return acc;
		}, {});
	return inputFiles;
};

const examples = await generateExampleInputFiles();

export default defineConfig({
	base: BASE_URL,
	build: {
		target: "esnext", // Needed so that build can occur with the top-level 'await' statements
		rollupOptions: {
			input: {
				main: resolve("index.html"),
				...examples,
			},
			output: {
				dir: "dist-website",
			},
		},
	},
	optimizeDeps: {
		exclude: ["@duckdb/duckdb-wasm"],
	},
	plugins: [VitePWA()],
});
