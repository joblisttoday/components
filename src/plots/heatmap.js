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
			type: "linear",
			scheme: "Turbo",
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
				fillOpacity: 0.9,
				stroke: "var(--c-bg)",
				inset: 1,
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
			// Optionally, label only the first day of each month
			// so you see short month names on the axis
			tickFormat: (date) => {
				// If you want to show “Jan”, “Feb” on the first day of each month:
				if (date.getUTCDate() === 1) {
					return d3.utcFormat("%b")(date);
				}
				return "";
			},
		},

		// Make y a band scale for the day of week
		y: {
			type: "band",
			domain: [0, 1, 2, 3, 4, 5, 6],
			tickFormat: (dow) =>
				["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dow],
		},

		style: {
			color: "var(--c-fg)",
			backgroundColor: "var(--c-bg)",
			borderColor: "var(--c-fg)",
		},
	});
}
