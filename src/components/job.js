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

export default class JoblistJob extends HTMLElement {
	static get observedAttributes() {
		return ["job"];
	}
	get job() {
		return JSON.parse(this.getAttribute("job"));
	}
	connectedCallback() {
		this.render();
	}
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

	createNameLink({ url, name }) {
		const nameLink = document.createElement("a");
		nameLink.target = "_blank";
		nameLink.textContent = name;
		nameLink.setAttribute("href", url);
		const $wrapper = document.createElement("joblist-job-name");
		$wrapper.append(nameLink);
		return $wrapper;
	}

	createPublishedDate({ published_date }) {
		const $element = document.createElement("joblist-job-published-date");
		const parsedDate = new Date(published_date);
		$element.textContent = `Published ${timeSince(parsedDate)}`;
		return $element;
	}

	createCompanyUrl({ company_slug, company_title }) {
		const $companyUrl = document.createElement("a");
		$companyUrl.target = "_blank";
		$companyUrl.textContent = `@${company_slug}`;
		$companyUrl.title = company_title;
		$companyUrl.setAttribute(
			"href",
			`https://profiles.joblist.today/companies/${company_slug}`,
		);
		const $wrapper = document.createElement("joblist-job-company-title");
		$wrapper.append($companyUrl);
		return $wrapper;
	}

	createLocation({ location }) {
		const $location = document.createElement("joblist-job-location");
		$location.textContent = `${location}`;
		return $location;
	}
}
