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
	connectedCallback() {
		this.render();
	}
	render() {
		const $jobDoms = this.createJobDoms({
			title: this.title,
			url: this.url,
			location: this.location,
		});
		this.replaceChildren(...$jobDoms);
	}
	createJobDoms({ title, url, location }) {
		const $jobName = document.createElement("joblist-board-job-name");
		const $jobNameAnchor = document.createElement("a");
		$jobNameAnchor.setAttribute("href", url);
		$jobNameAnchor.innerText = title;
		$jobName.append($jobNameAnchor);

		const $jobLocation = document.createElement("joblist-board-job-location");
		$jobLocation.innerText = location;

		return [$jobName, $jobLocation];
	}
}
