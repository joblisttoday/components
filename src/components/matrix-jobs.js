import mwc from "../libs/mwc.js";
import { MATRIX_ROOM_FILTER_JOB } from "../libs/sdk.js";

/**
 * Custom web component for displaying Matrix jobs room extending MWC matrix-room
 * @class JoblistMatrixJobs
 * @extends mwc.componentDefinitions["matrix-room"]
 */
export default class JoblistMatrixJobs extends mwc.componentDefinitions[
	"matrix-room"
] {
	/**
	 * Gets the room filter for job messages
	 * @returns {Object} Parsed filter object
	 */
	get filter() {
		return JSON.parse(this.getAttribute("filter")) || MATRIX_ROOM_FILTER_JOB;
	}
}
