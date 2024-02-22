// import our components, so they are available in observable
// see: https://github.com/observablehq/framework/issues/888
// import "./src/index.js";

// See https://observablehq.com/framework/config for documentation.
export default {
	// The project’s title; used in the sidebar and webpage titles.
	title: "Components",
	output: "dist-website",
	pager: false,
	style: "src/styles/index.css",

	// The pages and sections in the sidebar. If you don’t specify this option,
	// all pages will be listed in alphabetical order. Listing pages explicitly
	// lets you organize them into sections and have unlisted pages.
	pages: [
		{
			name: "Apps",
			pages: [
				{ name: "Search", path: "/apps/search" },
				{ name: "Map", path: "/apps/map" },
				{ name: "Heatmap", path: "/apps/heatmap" },
				{ name: "boards", path: "/apps/boards" },
			],
		},
		{
			name: "Companies",
			pages: [{ name: "company", path: "/components/company" }],
		},
		{
			name: "Jobs",
			pages: [{ name: "job", path: "/components/job" }],
		},
		{
			name: "Layout",
			pages: [
				{ name: "layout", path: "/components/layout" },
				{ name: "favicon", path: "/components/favicon" },
				{ name: "typography", path: "/components/typography" },
				{ name: "umami-script", path: "/components/umami-script" },
			],
		},
		{
			name: "Boards",
			pages: [
				{ name: "boards", path: "/components/boards" },
				{ name: "board", path: "/components/board" },
				{ name: "board-job", path: "/components/board-job" },
				{ name: "board-provider", path: "/components/board-provider" },
			],
		},
		{
			name: "Matrix",
			pages: [
				{ name: "matrix-auth", path: "/components/matrix-auth" },
				{ name: "matrix-job", path: "/components/matrix-job" },
				{ name: "matrix-jobs", path: "/components/matrix-jobs" },
				{
					name: "matrix-send-job-form",
					path: "/components/matrix-send-job-form",
				},
				{ name: "matrix-send-job", path: "/components/matrix-send-job" },
				{
					name: "matrix-widget-send-job",
					path: "/components/matrix-widget-send-job",
				},
			],
		},
		{
			name: "Search",
			pages: [
				{ name: "search", path: "/components/search" },
				{ name: "search-results", path: "/components/search-results" },
				{ name: "map-list", path: "/components/map-list" },
			],
		},
	],
	// Some additional configuration options and their defaults:
	// theme: "default", // try "light", "dark", "slate", etc.
	// header: "", // what to show in the header (HTML)
	// footer: "Built with Observable.", // what to show in the footer (HTML)
	// toc: true, // whether to show the table of contents
	// pager: true, // whether to show previous & next links in the footer
	// root: "docs", // path to the source root for preview
	// output: "dist", // path to the output root for build
};
