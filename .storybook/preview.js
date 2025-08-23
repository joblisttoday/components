import "../src/styles/index.css";
import "../src/index.js"; // Import all components
import { html } from "lit-html";

/** @type { import('@storybook/web-components').Preview } */
// Ensure global HTML attributes for layout/styles
if (typeof document !== "undefined") {
	const root = document.documentElement;
	root.setAttribute("lang", "en");
	root.setAttribute("joblist-layout", "");
}

const preview = {
	parameters: {
		actions: { argTypesRegex: "^on[A-Z].*" },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		docs: {
			extractComponentDescription: (component, { notes }) => {
				if (notes) {
					return typeof notes === "string"
						? notes
						: notes.markdown || notes.text;
				}
				return null;
			},
		},
		options: {
			storySort: {
				order: [
					"Introduction",
					"Site",
					"DuckDB",
					"Board Providers",
					"Matrix",
					"Stripe",
					"RemoteStorage",
					"*",
				],
			},
		},
	},
	tags: ["autodocs"],
};

// Global wrapper: replicate apps layout around every story
export const decorators = [
	(story) => {
		return html`
			<joblist-layout>
				<joblist-page> ${story()} </joblist-page>
			</joblist-layout>
		`;
	},
];

export default preview;
