/**
 * Tag display component for rendering searchable tag links.
 * Creates clickable tag elements with hashtag icons that link to search results.
 * 
 * @class JoblistTag
 * @extends HTMLElement
 */
export default class JoblistTag extends HTMLElement {
	/**
	 * Gets the tag value from the tag attribute.
	 * 
	 * @returns {*} Parsed tag value from JSON attribute
	 */
	get tag() {
		return JSON.parse(this.getAttribute("tag"));
	}
	/**
	 * Gets the base URL for tag search links.
	 * 
	 * @returns {string} Base URL for tag searches
	 */
	get origin() {
		return (
			this.getAttribute("origin") ||
			"https://components.joblist.today/apps/search#query=tags:"
		);
	}
	/**
	 * Lifecycle callback when component is added to DOM.
	 * Renders the tag element with current tag and origin values.
	 * 
	 *
	 */
	async connectedCallback() {
		this.render(this.tag, this.origin);
	}
	/**
	 * Renders the tag component.
	 * Replaces content with a clickable tag anchor element.
	 * 
	 * @param {*} tag - The tag value to display
	 * @param {string} origin - Base URL for tag link
	 */
	render(tag, origin) {
		this.replaceChildren(this.createAnchor(tag, origin));
	}
	/**
	 * Creates a clickable anchor element for the tag.
	 * Includes hashtag icon and tag text.
	 * 
	 * @param {*} tag - The tag value to display
	 * @param {string} origin - Base URL for tag link
	 * @returns {HTMLAnchorElement} Anchor element with icon and text
	 */
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
