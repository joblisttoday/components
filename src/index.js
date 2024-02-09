/* bundle styles */
import "./styles/index.css";

/* dependencies */
import mwc from "./libs/mwc.js";

/* sdk */
import joblistSDK, { JoblistSDK } from "./libs/sdk.js";
import * as joblistMapSDK from "./libs/map.js";

/* components */
import componentDefinitions from "./components/index.js";

/* auto define all components, if in browser */
export function defineComponents(components = componentDefinitions) {
	const isBrowser = typeof window !== "undefined";
	if (!isBrowser) return;
	Object.entries(components).map(([cTag, cDef]) => {
		if (!customElements.get(cTag)) {
			customElements.define(cTag, cDef);
		}
	});
}
defineComponents();
const joblist = {
	sdk: joblistSDK,
	map: joblistMapSDK,
	componentDefinitions,
	JoblistSDK,
};
export default joblist;
