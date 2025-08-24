import { sanitizeHtmlToDom } from "../utils/html-sanitizer.js";
import { formatDistanceToNow } from "date-fns";

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
	 * Gets the published date (ISO string) if provided
	 * @returns {string} The published date attribute
	 */
	get publishedDate() {
		return this.getAttribute("published-date");
	}

	/**
	 * Gets the employment type if provided
	 * @returns {string} The employment type attribute
	 */
	get employmentType() {
		return this.getAttribute("employment-type");
	}

	/**
	 * Gets the department if provided
	 * @returns {string} The department attribute
	 */
	get department() {
		return this.getAttribute("department");
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
		const $doms = [];

		const $jobHeader = document.createElement("joblist-board-job-header");

		const $jobName = document.createElement("joblist-board-job-name");
		const $jobNameAnchor = document.createElement("a");
		$jobNameAnchor.setAttribute("href", url);
		$jobNameAnchor.setAttribute("target", "_blank");
		$jobNameAnchor.setAttribute("rel", "noreferrer noopener");
		$jobNameAnchor.textContent = title;
		$jobName.append($jobNameAnchor);

		$jobHeader.append($jobName);
		$doms.push($jobHeader);

		// Employment type
		if (this.employmentType) {
			const $employmentType = document.createElement(
				"joblist-board-job-employment-type",
			);
			$employmentType.textContent = this.employmentType;
			$doms.push($employmentType);
		}

		const $jobLocation = document.createElement("joblist-board-job-location");
		$jobLocation.textContent = location;
		$doms.push($jobLocation);

		// Department
		if (this.department) {
			const $department = document.createElement(
				"joblist-board-job-department",
			);
			$department.textContent = this.department;
			$doms.push($department);
		}

		// Relative published date
		if (this.publishedDate) {
			try {
				const d = new Date(this.publishedDate);
				if (!Number.isNaN(d.getTime())) {
					const $published = document.createElement(
						"joblist-board-job-published",
					);
					$published.textContent = formatDistanceToNow(d, { addSuffix: true });
					$published.title = d.toString();
					$doms.push($published);
				}
			} catch {}
		}

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
