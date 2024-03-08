import JoblistUmamiScript from "./umami-script.js";
import JoblistFavicon from "./favicon.js";
import JoblistMenu from "./menu.js";
import JoblistCompany from "./company.js";
import JoblistJob from "./job.js";
import JoblistMapList from "./map-list.js";
import JoblistMatrixAuth from "./matrix-auth.js";
import JoblistMatrixJobs from "./matrix-jobs.js";
import JoblistMatrixJob from "./matrix-job.js";
import JoblistMatrixSendJob from "./matrix-send-job.js";
import JoblistMatrixSendJobForm from "./matrix-send-job-form.js";
import JoblistMatrixWidetSendJob from "./matrix-widget-send-job.js";
import JoblistSearch from "./search.js";
import JoblistSearchResults from "./search-results.js";
import JoblistBoards from "./boards.js";
import JoblistBoard from "./board.js";
import JoblistBoardProvider, { providerDefinitions } from "./board-provider.js";
import JoblistBoardJob from "./board-job.js";
import JoblistHeatmap from "./heatmap.js";
import JoblistPricingTable from "./pricing-table.js";
import JoblistBilling from "./billing.js";

const componentDefinitions = {
	"joblist-umami-script": JoblistUmamiScript,
	"joblist-favicon": JoblistFavicon,
	"joblist-menu": JoblistMenu,
	"joblist-search": JoblistSearch,
	"joblist-results": JoblistSearchResults,
	"joblist-map-list": JoblistMapList,
	"joblist-job": JoblistJob,
	"joblist-company": JoblistCompany,

	/* d3 & plots & stats */
	"joblist-heatmap": JoblistHeatmap,

	/* matrix */
	"joblist-matrix-auth": JoblistMatrixAuth,
	"joblist-matrix-jobs": JoblistMatrixJobs,
	"joblist-matrix-job": JoblistMatrixJob,
	"joblist-matrix-send-job": JoblistMatrixSendJob,
	"joblist-matrix-send-job-form": JoblistMatrixSendJobForm,
	"joblist-matrix-widget-send-job": JoblistMatrixWidetSendJob,

	/* boards */
	"joblist-boards": JoblistBoards,
	"joblist-board": JoblistBoard,
	"joblist-board-provider": JoblistBoardProvider,
	"joblist-board-job": JoblistBoardJob,

	/* stripe */
	"joblist-pricing-table": JoblistPricingTable,
	"joblist-billing": JoblistBilling,
};

export { componentDefinitions, providerDefinitions };
