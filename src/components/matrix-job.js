/* import mwc from "../libs/mwc.js"; */
/* import sdk from "../libs/sdk.js"; */
import sanitize from "../libs/sanitizer.js";

const JOB_KEYS = ["title", "description", "url"];

export default class JoblistMatrixJob extends HTMLElement {
	/* props */
	get event() {
		return JSON.parse(this.getAttribute("event"));
	}
	/* helpers */
	get content() {
		return this.event.content;
	}
	/* methods */
	addUrlSearch(urlString) {
		let urlFinal;
		try {
			const url = new URL(urlString);
			url.searchParams.set("utm_source", window.location.host);
			urlFinal = url.href;
		} catch (e) {
			urlFinal = urlString;
		}
		return urlFinal;
	}
	/* lifecycle */
	connectedCallback() {
		this._render();
	}
	_render() {
		const $doms = [];
		if (this.content.url && this.content.title) {
			$doms.push(
				this.createJobTitle(
					this.content.title,
					this.addUrlSearch(this.content.url),
				),
			);
		}
		if (this.content.description) {
			$doms.push(this.createJobDescription(this.content.description));
		}
		this.replaceChildren(...$doms);
	}
	createJobTitle(title, url) {
		const $jobTitle = document.createElement("joblist-matrix-job-title");
		const $jobAnchor = document.createElement("a");
		$jobAnchor.setAttribute("href", url);
		$jobAnchor.setAttribute("target", "_blank");
		$jobAnchor.setAttribute("rel", "noref noopener");
		$jobAnchor.textContent = title;
		$jobTitle.append($jobAnchor);
		return $jobTitle;
	}
	createJobDescription(desc) {
		const $jobDesc = document.createElement("joblist-matrix-job-description");
		$jobDesc.textContent = desc;
		return $jobDesc;
	}
}
