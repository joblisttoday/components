export default class JoblistMenu extends HTMLElement {
	/* props */
	get href() {
		return this.getAttribute("href") || "https://joblist.today";
	}
	get collapse() {
		return this.getAttribute("collapse") === "true";
	}
	get favicon() {
		return this.getAttribute("favicon") === "true";
	}
	/* helpers */
	get id() {
		return "joblist-menu";
	}
	connectedCallback() {
		this.render();
	}
	render() {
		this.prepend(this.createToggle(), this.createLabel());
		if (this.favicon) {
			this.append(this.createFavicon(this.href));
		}
	}
	createToggle() {
		const input = document.createElement("input");
		input.setAttribute("type", "checkbox");
		input.setAttribute("id", this.id);
		return input;
	}
	createLabel() {
		const label = document.createElement("label");
		label.setAttribute("for", this.id);
		return label;
	}
	createFavicon(href) {
		const favicon = document.createElement("joblist-favicon");
		favicon.setAttribute("href", href);
		return favicon;
	}
}
