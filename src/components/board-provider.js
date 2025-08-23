/**
 * Base provider component with search/filter utilities and provider wiring.
 * @module components/board-provider
 */
import personioApi from "../providers/personio.js";
import recruiteeApi from "../providers/recruitee.js";
import greenhouseApi from "../providers/greenhouse.js";
import smartrecruitersApi from "../providers/smartrecruiters.js";
import ashbyApi from "../providers/ashby.js";
import ripplingApi from "../providers/rippling.js";
import leverApi from "../providers/lever.js";
import workableApi from "../providers/workable.js";
import matrixApi from "../providers/matrix.js";

/**
 * Base class for job board provider components with search and filtering functionality
 * @class JoblistBoardProvider
 * @extends HTMLElement
 */
export default class JoblistBoardProvider extends HTMLElement {
	/** @type {Array} Array of job objects */
	model = [];
	/** @type {Array} Filtered array of job objects */
	filteredModel = [];
	/** @type {string} Current search term */
	searchTerm = "";

	/**
	 * Abstract method to get jobs from the provider
	 * @returns {Promise<Array>} Promise resolving to array of job objects
	 */
	getJobs = async () => {
		console.log("getJobs method not implemented for this job board provider");
	};

	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	async connectedCallback() {
		this.hostname = this.getAttribute("hostname");
		if (!this.hostname) return;

		try {
			if (this.hostname) {
				this.model = await this.getJobs({
					hostname: this.hostname,
				});
				this.filteredModel = [...this.model];
			} else {
				throw {
					error: "Missing provider hostname",
					errcode: "JOBLIST_BOARD_PROVIDER_MISSING_HOSTNAME",
				};
			}
		} catch (error) {
			console.info("Error", error);
			this.error = error;
		}
		this.render();
	}

	/**
	 * Filters jobs based on search term with simple text matching
	 * @param {string} searchTerm - The search term to filter by
	 */
	filterJobs(searchTerm) {
		if (!searchTerm.trim()) {
			this.filteredModel = [...this.model];
			return;
		}

		const terms = searchTerm.toLowerCase().trim().split(/\s+/);
		this.filteredModel = this.model.filter((job) => {
			const jobName = job.name ? job.name.toLowerCase() : "";
			const companyTitle = job.companyTitle
				? job.companyTitle.toLowerCase()
				: "";
			const location = job.location ? job.location.toLowerCase() : "";
			// Strip HTML tags from description for search
			const description = job.description 
				? job.description.replace(/<[^>]*>/g, '').toLowerCase() 
				: "";
			const searchableText = `${jobName} ${companyTitle} ${location} ${description}`;

			// Simple substring matching - much faster and more predictable
			return terms.every((term) => searchableText.includes(term));
		});
	}


	/**
	 * Creates search input and results count elements
	 * @returns {HTMLElement} Search container element
	 */
	createSearchInput() {
		const $searchContainer = document.createElement("joblist-board-search");

		const $searchInput = document.createElement("input");
		$searchInput.type = "text";
		$searchInput.placeholder = "Search jobs";
		$searchInput.value = this.searchTerm;

		$searchInput.addEventListener("input", (e) => {
			this.searchTerm = e.target.value;
			this.filterJobs(this.searchTerm);
			this.renderJobs();
		});

		const $resultsCount = document.createElement(
			"joblist-board-search-results",
		);
		const total = this.model.length;
		const filtered = this.filteredModel.length;
		$resultsCount.textContent = this.searchTerm
			? `Showing ${filtered} of ${total} jobs`
			: `${total} jobs available`;

		$searchContainer.append($searchInput, $resultsCount);
		return $searchContainer;
	}

	/**
	 * Renders the filtered job list
	 */
		renderJobs() {
		const $jobsContainer = this.querySelector("joblist-board-jobs");
		if (!$jobsContainer) return;

		if (this.filteredModel && this.filteredModel.length) {
			// Bind to ensure `this` context inside createJob
			const $jobs = this.filteredModel.map(this.createJob.bind(this));
			const $items = $jobs.map(($job) => {
				const $li = document.createElement("li");
				$li.append($job);
				return $li;
			});
			const $list = document.createElement("ul");
			$list.append(...$items);
			$jobsContainer.replaceChildren($list);
		} else if (this.searchTerm) {
			const $noResults = document.createElement("joblist-board-no-results");
			$noResults.textContent = "No jobs found matching your search.";
			$jobsContainer.replaceChildren($noResults);
		} else {
			const $noJob = document.createElement("joblist-board-job");
			$noJob.textContent =
				"Cannot get fetch jobs for this project and provider";
			$jobsContainer.replaceChildren($noJob);
		}

		// Update results count
		const $resultsCount = this.querySelector("joblist-board-search-results");
		if ($resultsCount) {
			const total = this.model.length;
			const filtered = this.filteredModel.length;
			$resultsCount.textContent = this.searchTerm
				? `Showing ${filtered} of ${total} jobs`
				: `${total} jobs available`;
		}
	}

	/**
	 * Renders the entire component with search and job list
	 */
	render() {
		const $doms = [];
		if (this.error) {
			$doms.push(this.createError(this.error));
		} else if (this.model && this.model.length) {
			$doms.push(this.createSearchInput());

			const $jobsContainer = document.createElement("joblist-board-jobs");
			$doms.push($jobsContainer);

			this.replaceChildren(...$doms);
			this.renderJobs();
			return;
		} else {
			const $noJob = document.createElement("joblist-board-job");
			$noJob.textContent =
				"Cannot get fetch jobs for this project and provider";
			$doms.push($noJob);
		}
		this.replaceChildren(...$doms);
	}
	/**
	 * Creates error element for display
	 * @param {Object} error - Error object to display
	 * @returns {HTMLElement} Error element
	 */
	createError(error) {
		const $error = document.createElement("joblist-error");
		$error.setAttribute("error", JSON.stringify(error));
		return $error;
	}
	/**
	 * Creates a job element from job data
	 * @param {Object} param0 - Job data object destructured
	 * @param {string} param0.name - Job name
	 * @param {string} param0.url - Job URL
	 * @param {string} param0.location - Job location
	 * @param {string} param0.description - Job description
	 * @returns {HTMLElement} Job element
	 */
	createJob({ name, url, location, description }) {
		if (name && url) {
			const $newJobItem = document.createElement("joblist-board-job");
			$newJobItem.setAttribute("title", name);
			$newJobItem.setAttribute("url", url);
			$newJobItem.setAttribute("location", location);
			
			// Create unique job ID based on URL and title
			const jobId = this.createJobId(url, name);
			$newJobItem.setAttribute("job-id", jobId);
			
			if (description) {
				$newJobItem.setAttribute("description", description);
			}
			return $newJobItem;
		}
	}

	/**
	 * Creates unique job ID from URL and title
	 * @param {string} url - Job URL
	 * @param {string} title - Job title
	 * @returns {string} Unique job ID
	 */
	createJobId(url, title) {
		// Create a unique ID based on URL and title  
		// This ensures consistency across sessions for the same job
		const baseString = `${url}-${title}`;
		return baseString
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')
			.substring(0, 100); // Limit length
	}
}

/**
 * Personio job board provider component
 * @class JoblistBoardPersonio
 * @extends JoblistBoardProvider
 */
export class JoblistBoardPersonio extends JoblistBoardProvider {
	id = personioApi.id;
	getJobs = personioApi.getJobs;
}

/**
 * Recruitee job board provider component
 * @class JoblistBoardRecruitee
 * @extends JoblistBoardProvider
 */
export class JoblistBoardRecruitee extends JoblistBoardProvider {
	id = recruiteeApi.id;
	getJobs = recruiteeApi.getJobs;
}

/**
 * SmartRecruiters job board provider component
 * @class JoblistBoardSmartrecruiters
 * @extends JoblistBoardProvider
 */
export class JoblistBoardSmartrecruiters extends JoblistBoardProvider {
	id = smartrecruitersApi.id;
	getJobs = smartrecruitersApi.getJobs;
}

/**
 * Greenhouse job board provider component
 * @class JoblistBoardGreenhouse
 * @extends JoblistBoardProvider
 */
export class JoblistBoardGreenhouse extends JoblistBoardProvider {
	id = greenhouseApi.id;
	getJobs = greenhouseApi.getJobs;
}

/**
 * Ashby job board provider component
 * @class JoblistBoardAshby
 * @extends JoblistBoardProvider
 */
export class JoblistBoardAshby extends JoblistBoardProvider {
	id = ashbyApi.id;
	getJobs = ashbyApi.getJobs;
}

/**
 * Lever job board provider component
 * @class JoblistBoardLever
 * @extends JoblistBoardProvider
 */
export class JoblistBoardLever extends JoblistBoardProvider {
	id = leverApi.id;
	getJobs = leverApi.getJobs;
}

/**
 * Workable job board provider component
 * @class JoblistBoardWorkable
 * @extends JoblistBoardProvider
 */
export class JoblistBoardWorkable extends JoblistBoardProvider {
	id = workableApi.id;
	getJobs = workableApi.getJobs;
}

/**
 * Matrix job board provider component
 * @class JoblistBoardMatrix
 * @extends JoblistBoardProvider
 */
export class JoblistBoardMatrix extends JoblistBoardProvider {
	id = matrixApi.id;
	getJobs = matrixApi.getJobs;
}

/**
 * Rippling job board provider component
 * @class JoblistBoardRippling
 * @extends JoblistBoardProvider
 */
export class JoblistBoardRippling extends JoblistBoardProvider {
	id = ripplingApi.id;
	getJobs = ripplingApi.getJobs;
}

export const providerDefinitions = {
	"joblist-board-greenhouse": JoblistBoardGreenhouse,
	"joblist-board-personio": JoblistBoardPersonio,
	"joblist-board-recruitee": JoblistBoardRecruitee,
	"joblist-board-smartrecruiters": JoblistBoardSmartrecruiters,
	"joblist-board-ashby": JoblistBoardAshby,
	"joblist-board-lever": JoblistBoardLever,
	"joblist-board-workable": JoblistBoardWorkable,
	"joblist-board-matrix": JoblistBoardMatrix,
	"joblist-board-rippling": JoblistBoardRippling,
};
