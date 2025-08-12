import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

export default function heatmap(
	data = [],
	{ width = 800, height = 200, id, days, ...options } = {}
) {
	data = data?.map((d) => {
		return {
			date: new Date(d.date),
			year: Number(d.year),
			woy: Number(d.woy),
			dow: Number(d.dow),
			total: Number(d.total),
		};
	});

	let idLabel = id ? `for ${id}` : "";
	let label = `Jobs postings over the last ${days} day${days > 1 ? "s" : ""
		} ${idLabel}`;

	return Plot.plot({
		width,
		height,
		color: {
			type: "threshold",
			domain: [1, 3, 6, 10],
			range: [
				"var(--c-heatmap-cell-0)",
				"var(--c-heatmap-cell-1)", 
				"var(--c-heatmap-cell-2)",
				"var(--c-heatmap-cell-3)",
				"var(--c-heatmap-cell-4)"
			],
			legend: true,
			label,
			className: "joblist-legend",
		},

		// Keep any extra Plot config passed in:
		...options,

		// Use Plot.cell with band scales
		marks: [
			Plot.cell(data, {
				// floor the date to the start of its week => each column is one week
				x: (d) => d3.timeWeek.floor(d.date),
				// day of week => each row is a day
				y: (d) => d.date.getDay(),
				fill: "total",
				fillOpacity: 1,
				stroke: "var(--c-heatmap-stroke)",
				strokeWidth: 1,
				inset: 0.5,
				title: (d) => {
					const date = d.date.toLocaleString("en-us", {
						year: "numeric",
						month: "short",
						day: "numeric",
					});
					return `${d.total || "No"} job${d.total > 1 ? "s" : ""
						} published on ${date}`;
				},
			}),
		],

		// Make x a band scale, so each distinct week is a discrete column
		x: {
			type: "band",
			tickFormat: (date) => {
				// Show month names at the beginning of each month
				if (date.getUTCDate() <= 7) {
					return d3.utcFormat("%b")(date);
				}
				return "";
			},
			grid: false,
			tickSize: 0,
		},

		// Make y a band scale for the day of week
		y: {
			type: "band",
			domain: [0, 1, 2, 3, 4, 5, 6],
			tickFormat: (dow) => {
				const days = ["S", "M", "T", "W", "T", "F", "S"];
				return dow % 2 === 1 ? days[dow] : ""; // Show only Mon, Wed, Fri
			},
			grid: false,
		},

		style: {
			color: "var(--c-heatmap-text)",
			backgroundColor: "transparent",
			fontFamily: "var(--font-family)",
			fontSize: "12px",
		},
	});
}
