import { MATRIX_TYPE_JOB } from "./sdk.js";
window.MWC_MANUAL_DEFINE = true;
import mwc from "npm:@sctlib/mwc";
import jobDisplayTemplate from "../templates/matrix-event/today.joblist.job/display.js";
import jobFormTemplate from "../templates/matrix-event/today.joblist.job/form.js";

/* all use existing form tempalte saved in a JS file */
mwc.eventsManager.registerEventType(MATRIX_TYPE_JOB, {
	displayTemplate: jobDisplayTemplate,
	formTemplate: jobFormTemplate,
});

/* finally intialize all components */
mwc.defineComponents(mwc.componentDefinitions);

export default mwc;
