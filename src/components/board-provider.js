import personioApi from "../providers/personio.js";
import recruiteeApi from "../providers/recruitee.js";
import greenhouseApi from "../providers/greenhouse.js";
import smartrecruitersApi from "../providers/smartrecruiters.js";
import ashbyApi from "../providers/ashby.js";
import leverApi from "../providers/lever.js";
import workableApi from "../providers/workable.js";
import matrixApi from "../providers/matrix.js";

/* a parent class to be extended by each provider */
export default class JoblistBoardProvider extends HTMLElement {
	model = [];

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

	render() {
		const $doms = [];
		if (this.error) {
			$doms.push(this.createError(this.error));
		} else if (this.model && this.model.length) {
			const $jobs = this.model.map(this.createJob);
			const $items = $jobs.map($job => {
				const $li = document.createElement('li')
				$li.append($job)
				return $li
			})
			const $list = document.createElement('ul')
			$list.append(...$items)
			$doms.push($list);
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
	createJob({ name, url, location }) {
		if (name && url) {
			const $newJobItem = document.createElement("joblist-board-job");
			$newJobItem.setAttribute("title", name);
			$newJobItem.setAttribute("url", url);
			$newJobItem.setAttribute("location", location);
			return $newJobItem;
		}
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

export const providerDefinitions = {
	"joblist-board-greenhouse": JoblistBoardGreenhouse,
	"joblist-board-personio": JoblistBoardPersonio,
	"joblist-board-recruitee": JoblistBoardRecruitee,
	"joblist-board-smartrecruiters": JoblistBoardSmartrecruiters,
	"joblist-board-ashby": JoblistBoardAshby,
	"joblist-board-lever": JoblistBoardLever,
	"joblist-board-workable": JoblistBoardWorkable,
	"joblist-board-matrix": JoblistBoardMatrix,
};
