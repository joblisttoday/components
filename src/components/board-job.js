import { sanitizeHtmlToDom } from "../utils/html-sanitizer.js";
import "./favorite-button.js";
import "./notes-editor.js";

/**
 * Custom web component for displaying job information in a board layout
 * @class JoblistBoardJob
 * @extends HTMLElement
 */
export default class JoblistBoardJob extends HTMLElement {
	/**
	 * Gets the job title
	 * @returns {string} The job title
	 */
	get title() {
		return this.getAttribute("title");
	}
	
	/**
	 * Gets the job URL
	 * @returns {string} The job URL
	 */
	get url() {
		return this.getAttribute("url");
	}
	
	/**
	 * Gets the job location
	 * @returns {string} The job location
	 */
	get location() {
		return this.getAttribute("location");
	}
	
	/**
	 * Gets the job description
	 * @returns {string} The job description
	 */
	get description() {
		return this.getAttribute("description");
	}
	
	/**
	 * Gets the job ID
	 * @returns {string} The job ID
	 */
	get jobId() {
		return this.getAttribute("job-id");
	}
	
	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	connectedCallback() {
		this.render();
	}
	
	/**
	 * Renders the job board component
	 */
	render() {
		const $jobDoms = this.createJobDoms({
			title: this.title,
			url: this.url,
			location: this.location,
			description: this.description,
			jobId: this.jobId,
		});
		this.replaceChildren(...$jobDoms);
	}
	/**
	 * Creates DOM elements for the job display
	 * @param {Object} param0 - Job data object destructured
	 * @param {string} param0.title - Job title
	 * @param {string} param0.url - Job URL
	 * @param {string} param0.location - Job location
	 * @param {string} param0.description - Job description
	 * @param {string} param0.jobId - Job ID
	 * @returns {HTMLElement[]} Array of job DOM elements
	 */
	createJobDoms({ title, url, location, description, jobId }) {
		const $jobHeader = document.createElement("joblist-board-job-header");
		
		const $jobName = document.createElement("joblist-board-job-name");
		const $jobNameAnchor = document.createElement("a");
		$jobNameAnchor.setAttribute("href", url);
		$jobNameAnchor.setAttribute("target", "_blank");
		$jobNameAnchor.setAttribute("rel", "noreferrer noopener");
		$jobNameAnchor.innerText = title;
		$jobName.append($jobNameAnchor);

		// Add favorite button if we have a job ID
		if (jobId) {
			const $favoriteBtn = document.createElement("joblist-favorite-button");
			$favoriteBtn.setAttribute("item-id", jobId);
			$favoriteBtn.setAttribute("item-type", "job");
			$jobHeader.append($jobName, $favoriteBtn);
		} else {
			$jobHeader.append($jobName);
		}

		const $jobLocation = document.createElement("joblist-board-job-location");
		$jobLocation.innerText = location;

		const $doms = [$jobHeader, $jobLocation];

		if (description) {
			const $jobDescription = document.createElement(
				"joblist-board-job-description",
			);
			$jobDescription.textContent =
				sanitizeHtmlToDom(description).textContent.slice(0, 321) + "...";
			$jobDescription.title = sanitizeHtmlToDom(description).textContent;
			$doms.push($jobDescription);
		}

		// Add notes section if we have a job ID
		if (jobId) {
			const $notesSection = document.createElement("details");
			const $notesSummary = document.createElement("summary");
			$notesSummary.textContent = "Notes";
			
			const $notesEditor = document.createElement("joblist-notes-editor");
			$notesEditor.setAttribute("item-id", jobId);
			$notesEditor.setAttribute("item-type", "job");
			
			$notesSection.append($notesSummary, $notesEditor);
			$doms.push($notesSection);
		}

		return $doms;
	}
}
