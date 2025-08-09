// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
	appType: "mpa",
	base: "./",
	build: {
		target: "esnext",
		lib: {
			entry: resolve("src/index.js"),
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
});
