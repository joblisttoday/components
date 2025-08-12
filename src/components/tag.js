export default class JoblistTag extends HTMLElement {
	get tag() {
		return JSON.parse(this.getAttribute("tag"));
	}
	get origin() {
		return (
			this.getAttribute("origin") ||
			"https://components.joblist.today/apps/search#query=tags:"
		);
	}
	async connectedCallback() {
		this.render(this.tag, this.origin);
	}
	render(tag, origin) {
		this.replaceChildren(this.createAnchor(tag, origin));
	}
	createAnchor(tag, origin) {
		const anchor = document.createElement("a");
		anchor.setAttribute("href", `${origin}${tag}`);

		// Add hashtag icon
		const icon = document.createElement("joblist-icon");
		icon.setAttribute("icon", "hash");
		icon.setAttribute("size", "small");
		anchor.appendChild(icon);

		// Add tag text
		const textSpan = document.createElement("span");
		textSpan.textContent = tag;
		anchor.appendChild(textSpan);

		return anchor;
	}
}
