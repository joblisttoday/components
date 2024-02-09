/* import mwc from "../libs/mwc.js"; */
/* import sdk from "../libs/sdk.js"; */
import sanitize from "../libs/sanitizer.js";

const JOB_KEYS = ["title", "description", "url"];

export default class JoblistMatrixJob extends HTMLElement {
	get event() {
		return JSON.parse(this.getAttribute("event"));
	}
	get content() {
		/* sanitize and only keep the values of the job as we know it */
		return Object.entries(this.event?.content).reduce((acc, [key, value]) => {
			if (JOB_KEYS.includes(key)) {
				acc[key] = sanitize(value);
			}
			return acc;
		}, {});
	}
	connectedCallback() {
		this._render();
	}
	_render() {
		const $doms = [];
		if (this.content.title) {
			$doms.push(this.createJobTitle(this.content.title));
		}
		if (this.content.url && this.content.title) {
			$doms.push(this.createJobUrl(this.content.url, this.content.title));
		}
		if (this.content.description) {
			$doms.push(this.createJobDescription(this.content.description));
		}
		this.replaceChildren(...$doms);
	}
	createJobTitle(title) {
		const $jobTitle = document.createElement("joblist-matrix-job-title");
		$jobTitle.textContent = title;
		return $jobTitle;
	}
	createJobUrl(url, title) {
		const $jobUrl = document.createElement("joblist-matrix-job-url");
		const $jobAnchor = document.createElement("a");
		$jobAnchor.setAttribute("href", url);
		$jobAnchor.textContent = title;
		return $jobUrl;
	}
	createJobDescription(desc) {
		const $jobDesc = document.createElement("joblist-matrix-job-description");
		$jobDesc.textContent = desc;
		return $jobDesc;
	}
}
