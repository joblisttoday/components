/* matrix
	 docs:
	 - https://spec.matrix.org/latest/
 */

import { Provider, Job } from "../utils/models.js";
import mwc from "../libs/mwc.js";
import { MATRIX_ROOM_FILTER_JOB } from "../libs/sdk.js";

const providerId = "matrix";
const EVENTS_LIMIT = 200;

const serializeJobs = ({ jobs = [], hostname, companyTitle, companySlug }) => {
	return jobs.map((event) => {
		const { event_id: id, content, origin_server_ts } = event;
		const { title, url, description, location } = content;
		return new Job({
			providerId,
			id: `${providerId}-${hostname}-${id}`,
			name: title,
			url,
			publishedDate: new Date(origin_server_ts),
			companyTitle: companyTitle || hostname,
			companySlug: companySlug || hostname,
			providerHostname: hostname,
			location,
		});
	});
};

const getJobs = async ({ hostname, companySlug = "", companyTitle = "" }) => {
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
				companySlug,
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
