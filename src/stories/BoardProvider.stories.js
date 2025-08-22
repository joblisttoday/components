import { html } from "lit-html";

import "../components/board-provider.js";
import "../providers/greenhouse.js";
import "../providers/personio.js";
import "../providers/lever.js";
import "../providers/workable.js";

export default {
	title: "Components/Job Boards",
	parameters: {
		docs: {
			description: {
				component:
					"Job board provider components that fetch and display jobs from various ATS systems.",
			},
		},
	},
};

// Board Providers
export const Greenhouse = () => html`
	<joblist-board-greenhouse hostname="neuralink"></joblist-board-greenhouse>
`;
Greenhouse.parameters = {
	docs: {
		description: {
			story:
				"Greenhouse job board integration. Requires a valid Greenhouse hostname.",
		},
	},
};
