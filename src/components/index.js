/**
 * Main component index module exporting all Joblist web components
 * @module components
 */

import JoblistUmamiScript from "./umami-script.js";
import JoblistFavicon from "./favicon.js";
import JoblistMenu from "./menu.js";
import JoblistCompany from "./company.js";
import JoblistCompanies from "./companies.js";
import JoblistCompaniesHighlighted from "./companies-highlighted.js";
import JoblistStats from "./stats.js";
import JoblistTag from "./tag.js";
import JoblistTags from "./tags.js";
import JoblistAindex, {
	JoblistAindexToc,
	JoblistAindexList,
} from "./aindex.js";
import JoblistJob from "./job.js";
import JoblistMapList from "./map-list.js";
// import JoblistMatrixAuth from "./matrix-auth.js"; // Commented out - mwc deprecated
// import JoblistMatrixJobs from "./matrix-jobs.js"; // Commented out - mwc deprecated
// import JoblistMatrixJob from "./matrix-job.js"; // Commented out - mwc deprecated
// import JoblistMatrixSendJob from "./matrix-send-job.js"; // Commented out - mwc deprecated
// import JoblistMatrixSendJobForm from "./matrix-send-job-form.js"; // Commented out - mwc deprecated
// import JoblistMatrixWidetSendJob from "./matrix-widget-send-job.js"; // Commented out - mwc deprecated
import JoblistSearch from "./search.js";
import JoblistSearchResults from "./search-results.js";
import JoblistBoards from "./boards.js";
import JoblistBoard from "./board.js";
import JoblistBoardProvider, { providerDefinitions } from "./board-provider.js";
import JoblistBoardJob from "./board-job.js";
import JoblistHeatmap from "./heatmap.js";
import JoblistPricingTable from "./pricing-table.js";
import JoblistBilling from "./billing.js";
import JoblistSocialWidget from "./social-widget.js";
import JoblistSocialLink from "./social-link.js";
import JoblistIcon from "./icon.js";

const componentDefinitions = {
	"joblist-umami-script": JoblistUmamiScript,
	"joblist-favicon": JoblistFavicon,
	"joblist-menu": JoblistMenu,
	"joblist-search": JoblistSearch,
	"joblist-results": JoblistSearchResults,
	"joblist-map-list": JoblistMapList,
	"joblist-job": JoblistJob,
	"joblist-company": JoblistCompany,
	"joblist-companies": JoblistCompanies,
	"joblist-companies-highlighted": JoblistCompaniesHighlighted,
	"joblist-stats": JoblistStats,
	"joblist-tag": JoblistTag,
	"joblist-tags": JoblistTags,
	"joblist-aindex": JoblistAindex,
	"joblist-aindex-toc": JoblistAindexToc,
	"joblist-aindex-list": JoblistAindexList,

	/* d3 & plots & stats */
	"joblist-heatmap": JoblistHeatmap,

	/* matrix */
	// "joblist-matrix-auth": JoblistMatrixAuth, // Commented out - mwc deprecated
	// "joblist-matrix-jobs": JoblistMatrixJobs, // Commented out - mwc deprecated
	// "joblist-matrix-job": JoblistMatrixJob, // Commented out - mwc deprecated
	// "joblist-matrix-send-job": JoblistMatrixSendJob, // Commented out - mwc deprecated
	// "joblist-matrix-send-job-form": JoblistMatrixSendJobForm, // Commented out - mwc deprecated
	// "joblist-matrix-widget-send-job": JoblistMatrixWidetSendJob, // Commented out - mwc deprecated

	/* boards */
	"joblist-boards": JoblistBoards,
	"joblist-board": JoblistBoard,
	"joblist-board-provider": JoblistBoardProvider,
	"joblist-board-job": JoblistBoardJob,

	/* stripe */
	"joblist-pricing-table": JoblistPricingTable,
	"joblist-billing": JoblistBilling,

	/* social */
	"joblist-social-widget": JoblistSocialWidget,
	"joblist-social-link": JoblistSocialLink,
	"joblist-icon": JoblistIcon,

};

/**
 * Export component and provider definitions for custom element registration
 * @module componentDefinitions - Main component definitions
 * @module providerDefinitions - Job board provider definitions
 */
export { componentDefinitions, providerDefinitions };
