export default class JoblistTag extends HTMLElement {
	get tag() {
		return JSON.parse(this.getAttribute("tag"))
	}
	get origin() {
		return this.getAttribute("origin") || "https://components.joblist.today/apps/search?query=tags:"
	}
	async connectedCallback() {
		this.render(this.tag, this.origin);
	}
	render(tag, origin) {
		this.replaceChildren(this.createAnchor(tag, origin));
	}
	createAnchor(tag, origin) {
		const anchor = document.createElement("a")
		anchor.setAttribute("href", `${origin}${tag}`)
		anchor.textContent = tag
		return anchor
	}
}
