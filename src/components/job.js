/**
 * Formats a date object into a localized string representation
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string or "Invalid date" if date is invalid
 */
function formatDate(date) {
	const options = {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	};
	if (isNaN(date.getTime())) {
		// Check if the date is valid
		return "Invalid date";
	} else {
		return new Intl.DateTimeFormat(navigator.language, options).format(date);
	}
}
/**
 * Calculates and returns a human-readable time difference from a given date to now
 * @param {string|Date} inputDate - The input date to compare against current time
 * @returns {string} Human-readable time difference (e.g., "2 hours ago", "3 days ago")
 */
function timeSince(inputDate) {
	const date = new Date(inputDate);
	if (isNaN(date.getTime())) {
		return "";
	}

	const now = new Date();
	const secondsPast = Math.floor((now - date) / 1000);
	if (secondsPast < 60) {
		return `${secondsPast} seconds ago`;
	}
	const minutesPast = Math.floor(secondsPast / 60);
	if (minutesPast < 60) {
		return `${minutesPast} minutes ago`;
	}
	const hoursPast = Math.floor(minutesPast / 60);
	if (hoursPast < 24) {
		return `${hoursPast} hours ago`;
	}
	const daysPast = Math.floor(hoursPast / 24);
	if (daysPast < 7) {
		return `${daysPast} days ago`;
	}
	const weeksPast = Math.floor(daysPast / 7);
	if (weeksPast < 4) {
		return `${weeksPast} weeks ago`;
	}
	const monthsPast = Math.floor(daysPast / 30);
	if (monthsPast < 12) {
		return `${monthsPast} months ago`;
	}
	const yearsPast = Math.floor(daysPast / 365);
	return `${yearsPast} years ago`;
}

/**
 * Custom web component for displaying job information
 * @class JoblistJob
 * @extends HTMLElement
 */
export default class JoblistJob extends HTMLElement {
	/**
	 * Observed attributes for the component
	 * @returns {string[]} Array of attribute names to observe
	 */
	static get observedAttributes() {
		return ["job"];
	}
	
	/**
	 * Gets the job data from the job attribute
	 * @returns {Object} Parsed job object
	 */
	get job() {
		return JSON.parse(this.getAttribute("job"));
	}
	
	/**
	 * Gets the origin URL for links
	 * @returns {string} Origin URL, defaults to https://joblist.today
	 */
	get origin() {
		return this.getAttribute("origin") || "https://joblist.today";
	}
	
	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	connectedCallback() {
		this.render();
	}
	/**
	 * Renders the job component with all its elements
	 */
	render() {
		const $doms = [];

		// Check if all necessary attributes are available
		if (this.job) {
			$doms.push(
				this.createCompanyUrl(this.job),
				this.createNameLink(this.job),
				this.createLocation(this.job),
				this.createPublishedDate(this.job),
			);
		} else {
			$doms.push(`Missing job information`);
		}

		this.append(...$doms);
	}

	/**
	 * Creates a clickable job name link element
	 * @param {Object} param0 - Job object destructured
	 * @param {string} param0.url - Job URL
	 * @param {string} param0.name - Job name/title
	 * @returns {HTMLElement} Wrapped job name link element
	 */
	createNameLink({ url, name }) {
		const nameLink = document.createElement("a");
		nameLink.target = "_blank";
		nameLink.textContent = name;
		nameLink.setAttribute("href", url);
		const $wrapper = document.createElement("joblist-job-name");
		$wrapper.append(nameLink);
		return $wrapper;
	}

	/**
	 * Creates a published date element showing time since publication
	 * @param {Object} param0 - Job object destructured
	 * @param {string} param0.published_date - Job publication date
	 * @returns {HTMLElement} Published date element
	 */
	createPublishedDate({ published_date }) {
		const $element = document.createElement("joblist-job-published-date");
		const parsedDate = new Date(published_date);
		$element.textContent = `Published ${timeSince(parsedDate)}`;
		return $element;
	}

	/**
	 * Creates a company URL link element
	 * @param {Object} param0 - Job object destructured
	 * @param {string} param0.company_id - Company ID
	 * @param {string} param0.company_title - Company title
	 * @returns {HTMLElement} Wrapped company URL element
	 */
	createCompanyUrl({ company_id, company_title }) {
		const $companyUrl = document.createElement("a");
		$companyUrl.target = "_blank";
		$companyUrl.textContent = `@${company_id}`;
		$companyUrl.title = company_title;
		$companyUrl.setAttribute("href", `${this.origin}/${company_id}`);
		const $wrapper = document.createElement("joblist-job-company-title");
		$wrapper.append($companyUrl);
		return $wrapper;
	}

	/**
	 * Creates a location display element
	 * @param {Object} param0 - Job object destructured
	 * @param {string} param0.location - Job location
	 * @returns {HTMLElement} Location element
	 */
	createLocation({ location }) {
		const $location = document.createElement("joblist-job-location");
		$location.textContent = `${location}`;
		return $location;
	}
}
