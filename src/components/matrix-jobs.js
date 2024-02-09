import mwc from "../libs/mwc.js";
import { MATRIX_ROOM_FILTER_JOB } from "../libs/sdk.js";

export default class JoblistMatrixJobs extends mwc.componentDefinitions[
	"matrix-room"
] {
	get filter() {
		return JSON.parse(this.getAttribute("filter")) || MATRIX_ROOM_FILTER_JOB;
	}
}
