import { html } from "lit-html";

import "../components/board-provider.js";
import "../providers/greenhouse.js";
import "../providers/personio.js";
import "../providers/lever.js";
import "../providers/workable.js";

export default {
	title: "Board Providers/Providers",
	parameters: { layout: "padded" },
};

// Board Providers
export const Greenhouse = () => html`
	<joblist-board-greenhouse hostname="neuralink"></joblist-board-greenhouse>
`;
