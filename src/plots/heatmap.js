import * as Plot from "@observablehq/plot";

export default function heatmap(
	data = [],
	{ width = 800, height = 200, ...options } = {},
) {
	data = data.map((d) => {
		return {
			date: new Date(d.date),
			year: Number(d.year),
			woy: Number(d.woy),
			dow: Number(d.dow),
			total: Number(d.total),
		};
	});
	console.log("plot data", data);
	return Plot.plot({
		width,
		height,
		color: { type: "linear", scheme: "Turbo" },
		...options,
		marks: [
			Plot.cell(data, {
				x: (d) => {
					return Number([d.year, d.woy].join("."));
				},
				y: (d) => d.dow,
				fill: "total",
				fillOpacity: 0.9,
				stroke: "var(--c-bg)",
				inset: 1,
				title: (d) => {
					const date = d.date.toLocaleString("en-us", {
						year: "numeric",
						month: "short",
						day: "numeric",
					});
					return `${d.total || "No"} job${d.total > 1 ? "s" : ""} published on ${date}, ${d.woy}`;
				},
			}),
		],
		x: {
			tickFormat: (x) => {
				const [year, woy] = x.toString().split(".");
				if (woy % 7 === 0) {
					return new Date(1000 * 60 * 60 * 24 * 7 * woy).toLocaleString(
						"en-us",
						{
							month: "short",
						},
					);
				}
			},
		},
		y: {
			tickFormat: (dow) => {
				if (dow % 2 === 0) {
					return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dow];
				}
			},
		},
		style: {
			color: "var(--c-fg)",
			backgroundColor: "var(--c-bg)",
			borderColor: "var(--c-fg)",
		},
	});
}
