/**
 * @fileoverview Matrix protocol job board integration
 * @see {@link https://spec.matrix.org/latest/}
 */

/**
 * @typedef {Object} MatrixJobContent
 * @property {string} title - Job title
 * @property {string} url - Job application URL
 * @property {string} description - Job description
 * @property {string} location - Job location
 */

/**
 * @typedef {Object} MatrixRoomEvent
 * @property {string} event_id - Matrix event ID
 * @property {MatrixJobContent} content - Event content
 * @property {number} origin_server_ts - Unix timestamp
 */

/**
 * @typedef {Object} MatrixMessagesResponse
 * @property {MatrixRoomEvent[]} chunk - Array of room events
 * @property {string} [error] - Error message if request failed
 */

import { Provider, Job } from "../utils/models.js";
// import mwc from "../libs/mwc.js"; // Commented out - mwc deprecated
import { MATRIX_ROOM_FILTER_JOB } from "../libs/sdk.js";


const providerId = "matrix";
const EVENTS_LIMIT = 200;

const serializeJobs = ({ jobs = [], hostname, companyTitle, companyId }) => {
	return jobs.map((event) => {
		const { event_id: id, content, origin_server_ts } = event;
		const { title, url, description, location } = content;
		return new Job({
			providerId,
			id: id,
			name: title,
			description: description,
			url,
			publishedDate: new Date(origin_server_ts),
			companyTitle: companyTitle || hostname,
			companyId: companyId || hostname,
			providerHostname: hostname,
			location,
		});
	});
};

const getJobs = async ({ hostname, companyId = "", companyTitle = "" }) => {
	try {
		// const res = await mwc.api.getRoomMessages({
		// 	roomId: hostname,
		// 	params: [
		// 		["filter", MATRIX_ROOM_FILTER_JOB],
		// 		["limit", EVENTS_LIMIT],
		// 	],
		// }); // Commented out - mwc deprecated
		throw new Error("Matrix provider temporarily disabled - mwc deprecated");
		if (res.error) {
			throw res;
		} else {
			return serializeJobs({
				jobs: res.chunk,
				hostname,
				companyTitle,
				companyId,
			});
		}
	} catch (e) {
		throw e;
	}
};

const api = new Provider({
	id: providerId,
	getJobs,
});

export default api;
export { getJobs };
