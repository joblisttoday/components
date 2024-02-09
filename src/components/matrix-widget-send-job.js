import mwc from "../libs/mwc.js";
import { MATRIX_TYPE_JOB } from "../libs/sdk.js";

export default class JoblistMatrixJobs extends mwc.componentDefinitions[
	"matrix-send-event"
] {
	get eventType() {
		return JSON.parse(this.getAttribute("event-type")) || MATRIX_TYPE_JOB;
	}
	get isWidget() {
		return true;
	}
}
