import JoblistCompany from "./company.js";
import JoblistFavicon from "./favicon.js";
import JoblistJob from "./job.js";
import JoblistMapList from "./map-list.js";
import JoblistMatrixAuth from "./matrix-auth.js";
import JoblistMatrixJobs from "./matrix-jobs.js";
import JoblistMatrixJob from "./matrix-job.js";
import JoblistMatrixSendJob from "./matrix-send-job.js";
import JoblistMatrixSendJobForm from "./matrix-send-job-form.js";
import JoblistSearch from "./search.js";
import JoblistSearchResults from "./search-results.js";
import JoblistUmamiScript from "./umami-script.js";

const componentDefinitions = {
	"joblist-company": JoblistCompany,
	"joblist-favicon": JoblistFavicon,
	"joblist-job": JoblistJob,
	"joblist-map-list": JoblistMapList,
	"joblist-matrix-auth": JoblistMatrixAuth,
	"joblist-matrix-jobs": JoblistMatrixJobs,
	"joblist-matrix-job": JoblistMatrixJob,
	"joblist-matrix-send-job": JoblistMatrixSendJob,
	"joblist-matrix-send-job-form": JoblistMatrixSendJobForm,
	"joblist-search": JoblistSearch,
	"joblist-results": JoblistSearchResults,
	"joblist-umami-script": JoblistUmamiScript,
};

export default componentDefinitions;
