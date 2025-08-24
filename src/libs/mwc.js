import { MATRIX_TYPE_JOB } from "./sdk.js";
window.MWC_MANUAL_DEFINE = true;
// import mwc from "@sctlib/mwc"; // Commented out - mwc deprecated
// import jobDisplayTemplate from "../templates/matrix-event/today.joblist.job/display.js"; // Commented out - mwc deprecated
// import jobFormTemplate from "../templates/matrix-event/today.joblist.job/form.js"; // Commented out - mwc deprecated

/* all use existing form tempalte saved in a JS file */
// mwc.eventsManager.registerEventType(MATRIX_TYPE_JOB, { // Commented out - mwc deprecated
// 	displayTemplate: jobDisplayTemplate,
// 	formTemplate: jobFormTemplate,
// }); // Commented out - mwc deprecated

/* finally intialize all components */
// mwc.defineComponents(mwc.componentDefinitions); // Commented out - mwc deprecated

// Temporary fallback object while mwc is deprecated
const mwcFallback = {
	api: null,
	componentDefinitions: {},
	eventsManager: null
};

export default mwcFallback;
