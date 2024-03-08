export default class JoblistMenu extends HTMLElement {
	get id() {
		return "joblist-menu";
	}
	get collapse() {
		return this.getAttribute("collapse") === "true";
	}
	connectedCallback() {
		this.render();
	}
	render() {
		if (this.collapse) {
		}
		this.prepend(this.createToggle(), this.createLabel());
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
}
