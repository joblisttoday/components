/* matrix
	 docs:
	 - https://spec.matrix.org/latest/
 */

import { Provider, Job } from "../utils/models.js";
import mwc from "../libs/mwc.js";
import { MATRIX_ROOM_FILTER_JOB } from "../libs/sdk.js";
import { sanitizeHtml } from "../utils/html-sanitizer.js";

const providerId = "matrix";
const EVENTS_LIMIT = 200;

const serializeJobs = ({ jobs = [], hostname, companyTitle, companyId }) => {
	return jobs.map((event) => {
		const { event_id: id, content, origin_server_ts } = event;
		const { title, url, description, location } = content;
		return new Job({
			providerId,
			id: `${providerId}-${hostname}-${id}`,
			name: title,
			description: description ? sanitizeHtml(description) : undefined,
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
		const res = await mwc.api.getRoomMessages({
			roomId: hostname,
			params: [
				["filter", MATRIX_ROOM_FILTER_JOB],
				["limit", EVENTS_LIMIT],
			],
		});
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
