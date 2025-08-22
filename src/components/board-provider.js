import personioApi from "../providers/personio.js";
import recruiteeApi from "../providers/recruitee.js";
import greenhouseApi from "../providers/greenhouse.js";
import smartrecruitersApi from "../providers/smartrecruiters.js";
import ashbyApi from "../providers/ashby.js";
import ripplingApi from "../providers/rippling.js";
import leverApi from "../providers/lever.js";
import workableApi from "../providers/workable.js";
import matrixApi from "../providers/matrix.js";

/* a parent class to be extended by each provider */
export default class JoblistBoardProvider extends HTMLElement {
	model = [];
	filteredModel = [];
	searchTerm = "";

	getJobs = async () => {
		console.log("getJobs method not implemented for this job board provider");
	};

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

			return terms.every((term) => this.fuzzyMatch(searchableText, term));
		});
	}

	fuzzyMatch(text, pattern) {
		// Direct substring match (fastest)
		if (text.includes(pattern)) return true;

		// Fuzzy character sequence matching
		let textIndex = 0;
		let patternIndex = 0;

		while (textIndex < text.length && patternIndex < pattern.length) {
			if (text[textIndex] === pattern[patternIndex]) {
				patternIndex++;
			}
			textIndex++;
		}

		// If we matched all pattern characters, it's a fuzzy match
		if (patternIndex === pattern.length) return true;

		// Additional fuzzy matching for common typos and abbreviations
		// Split pattern into words and check if most words match
		const patternWords = pattern.split(/\s+/).filter(w => w.length > 0);
		const textWords = text.split(/\s+/);
		
		if (patternWords.length === 1) return false; // Single word already failed above
		
		let matchedWords = 0;
		patternWords.forEach(pWord => {
			if (textWords.some(tWord => 
				tWord.includes(pWord) || 
				pWord.includes(tWord) ||
				this.simpleLevenshtein(tWord, pWord) <= Math.max(1, Math.floor(pWord.length * 0.2))
			)) {
				matchedWords++;
			}
		});
		
		// Match if at least 70% of words match
		return matchedWords >= Math.ceil(patternWords.length * 0.7);
	}

	simpleLevenshtein(a, b) {
		if (a.length === 0) return b.length;
		if (b.length === 0) return a.length;
		
		const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
		
		for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
		for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
		
		for (let i = 1; i <= a.length; i++) {
			for (let j = 1; j <= b.length; j++) {
				const cost = a[i - 1] === b[j - 1] ? 0 : 1;
				matrix[i][j] = Math.min(
					matrix[i - 1][j] + 1,      // deletion
					matrix[i][j - 1] + 1,      // insertion  
					matrix[i - 1][j - 1] + cost // substitution
				);
			}
		}
		
		return matrix[a.length][b.length];
	}

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

	renderJobs() {
		const $jobsContainer = this.querySelector("joblist-board-jobs");
		if (!$jobsContainer) return;

		if (this.filteredModel && this.filteredModel.length) {
			const $jobs = this.filteredModel.map(this.createJob);
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
	createError(error) {
		const $error = document.createElement("joblist-error");
		$error.setAttribute("error", JSON.stringify(error));
		return $error;
	}
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

class JoblistBoardPersonio extends JoblistBoardProvider {
	id = personioApi.id;
	getJobs = personioApi.getJobs;
}

class JoblistBoardRecruitee extends JoblistBoardProvider {
	id = recruiteeApi.id;
	getJobs = recruiteeApi.getJobs;
}

class JoblistBoardSmartrecruiters extends JoblistBoardProvider {
	id = smartrecruitersApi.id;
	getJobs = smartrecruitersApi.getJobs;
}

class JoblistBoardGreenhouse extends JoblistBoardProvider {
	id = greenhouseApi.id;
	getJobs = greenhouseApi.getJobs;
}

class JoblistBoardAshby extends JoblistBoardProvider {
	id = ashbyApi.id;
	getJobs = ashbyApi.getJobs;
}

class JoblistBoardLever extends JoblistBoardProvider {
	id = leverApi.id;
	getJobs = leverApi.getJobs;
}

class JoblistBoardWorkable extends JoblistBoardProvider {
	id = workableApi.id;
	getJobs = workableApi.getJobs;
}
class JoblistBoardMatrix extends JoblistBoardProvider {
	id = matrixApi.id;
	getJobs = matrixApi.getJobs;
}

class JoblistBoardRippling extends JoblistBoardProvider {
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
