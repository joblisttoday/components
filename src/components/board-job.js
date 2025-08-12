import { sanitizeHtmlToDom } from "../utils/html-sanitizer.js";

export default class JoblistBoardJob extends HTMLElement {
	get title() {
		return this.getAttribute("title");
	}
	get url() {
		return this.getAttribute("url");
	}
	get location() {
		return this.getAttribute("location");
	}
	get description() {
		return this.getAttribute("description");
	}
	connectedCallback() {
		this.render();
	}
	render() {
		const $jobDoms = this.createJobDoms({
			title: this.title,
			url: this.url,
			location: this.location,
			description: this.description,
		});
		this.replaceChildren(...$jobDoms);
	}
	createJobDoms({ title, url, location, description }) {
		const $jobName = document.createElement("joblist-board-job-name");
		const $jobNameAnchor = document.createElement("a");
		$jobNameAnchor.setAttribute("href", url);
		$jobNameAnchor.setAttribute("target", "_blank");
		$jobNameAnchor.setAttribute("rel", "noreferrer noopener");
		$jobNameAnchor.innerText = title;
		$jobName.append($jobNameAnchor);

		const $jobLocation = document.createElement("joblist-board-job-location");
		$jobLocation.innerText = location;

		const $doms = [$jobName, $jobLocation];

		if (description) {
			const $jobDescription = document.createElement(
				"joblist-board-job-description",
			);
			$jobDescription.textContent =
				sanitizeHtmlToDom(description).textContent.slice(0, 321) + "...";
			$jobDescription.title = sanitizeHtmlToDom(description).textContent;
			$doms.push($jobDescription);
		}

		return $doms;
	}
}
