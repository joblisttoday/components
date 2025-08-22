import { sanitizeHtml } from "../utils/html-sanitizer.js";

/**
 * Job content keys for validation
 * @const {string[]}
 */
const JOB_KEYS = ["title", "description", "url"];

/**
 * Custom web component for displaying Matrix job events
 * @class JoblistMatrixJob
 * @extends HTMLElement
 */
export default class JoblistMatrixJob extends HTMLElement {
	/**
	 * Gets the Matrix event data from attribute
	 * @returns {Object} Parsed Matrix event object
	 */
	get event() {
		return JSON.parse(this.getAttribute("event"));
	}
	
	/**
	 * Gets the content from the Matrix event
	 * @returns {Object} Event content object
	 */
	get content() {
		return this.event.content;
	}
	
	/**
	 * Adds UTM source parameter to URL
	 * @param {string} urlString - Original URL string
	 * @returns {string} URL with UTM parameters
	 */
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
	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	connectedCallback() {
		this._render();
	}
	
	/**
	 * Renders the Matrix job content
	 */
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
	/**
	 * Creates job title element with link
	 * @param {string} title - Job title
	 * @param {string} url - Job URL
	 * @returns {HTMLElement} Job title element
	 */
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
	/**
	 * Creates job description element
	 * @param {string} desc - Job description
	 * @returns {HTMLElement} Job description element
	 */
	createJobDescription(desc) {
		const $jobDesc = document.createElement("joblist-matrix-job-description");
		$jobDesc.textContent = desc;
		return $jobDesc;
	}
}
