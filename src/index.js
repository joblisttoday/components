/* bundle styles */
import "./styles/index.css";

/* dependencies */
import mwc from "./libs/mwc.js";

/* sdk */
import * as SDK from "./libs/sdk.js";
import joblistDuckDBSDK, { JoblistDuckDBSDK } from "./libs/sdk-duckdb.js";
import joblistApiSDK, { JoblistApiSDK } from "./libs/sdk-api.js";
import joblistGithubSDK, { JoblistGithubSDK } from "./libs/sdk-github.js";
import * as joblistMapSDK from "./libs/map.js";
import joblistBoardProviders from "./providers/index.js";

/* components */
import {
	componentDefinitions,
	providerDefinitions,
} from "./components/index.js";

/* auto define all components, if in browser */
export function defineComponents(components) {
	const isBrowser = typeof window !== "undefined";
	if (!isBrowser) return;
	Object.entries(components).map(([cTag, cDef]) => {
		if (!customElements.get(cTag)) {
			customElements.define(cTag, cDef);
		}
	});
}

defineComponents(componentDefinitions);
defineComponents(providerDefinitions);

const joblist = {
	JoblistDuckDBSDK,
	JoblistApiSDK,
	JoblistGithubSDK,
	sdk: SDK,
	duckDBSdk: joblistDuckDBSDK,
	apiSdk: joblistApiSDK,
	githubSdk: joblistGithubSDK,
	mapSdk: joblistMapSDK,
	providers: joblistBoardProviders,
	componentDefinitions,
	providerDefinitions,
};

export default joblist;
