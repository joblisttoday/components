import JoblistFavicon from "./favicon.js";
import JoblistSearch from "./search.js";
import JoblistSearchResults from "./search-results.js";
import JoblistCompany from "./company.js";
import JoblistJob from "./job.js";
import JoblistMapList from "./map-list.js";
import JoblistUmamiScript from "./umami-script.js";

const componentDefinitions = {
	"joblist-favicon": JoblistFavicon,
	"joblist-search": JoblistSearch,
	"joblist-results": JoblistSearchResults,
	"joblist-company": JoblistCompany,
	"joblist-job": JoblistJob,
	"joblist-map-list": JoblistMapList,
	"joblist-umami-script": JoblistUmamiScript,
};

export default componentDefinitions;
