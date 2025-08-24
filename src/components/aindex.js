/**
 * Function to sort index alphabetically
 * @param {string} a - First string to compare
 * @param {string} b - Second string to compare
 * @returns {number} Comparison result for sorting
 */
export function sortIndex(a, b) {
	return a.localeCompare(b);
}

/**
 * Custom web component for displaying an alphabetical index with table of contents
 * @class JoblistAindex
 * @extends HTMLElement
 */
export default class JoblistAindex extends HTMLElement {
	/**
	 * Gets the index data from the index attribute
	 * @returns {Array} Parsed index array
	 */
	get index() {
		return JSON.parse(this.getAttribute("index") || "[]");
	}

	/**
	 * Gets the key attribute to determine which property to index by
	 * @returns {string} The key to use for indexing
	 */
	get key() {
		return this.getAttribute("key");
	}

	/**
	 * Gets the template element for rendering list items
	 * @returns {HTMLTemplateElement} The template element
	 */
	get template() {
		return this.querySelector("template");
	}

	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	connectedCallback() {
		this.render(this.index, this.key);

		this.onScroll = this.onScroll.bind(this);

		Promise.all([
			customElements.whenDefined("joblist-aindex-toc"),
			customElements.whenDefined("joblist-aindex-list"),
		]).then(() => {
			this.toc = this.querySelector("joblist-aindex-toc");
			this.list = this.querySelector("joblist-aindex-list");
			this.sections = this.list.querySelectorAll("section");
			this.links = this.toc.querySelectorAll("a");
			window.addEventListener("scroll", this.onScroll, { passive: true });
			this.onScroll();
		});
	}

	disconnectedCallback() {
		window.removeEventListener("scroll", this.onScroll);
	}

	onScroll() {
		window.requestAnimationFrame(() => {
			if (!this.sections || !this.links) {
				return;
			}

			this.sections.forEach((section) => {
				const rect = section.getBoundingClientRect();
				const isInView =
					rect.top < window.innerHeight * 0.1 && rect.bottom >= 0;

				const link = this.toc.querySelector(`a[href="#${section.id}"]`);
				if (link) {
					if (isInView) {
						link.setAttribute("aria-current", "true");
					} else {
						link.removeAttribute("aria-current");
					}
				}
			});
		});
	}

	/**
	 * Renders the alphabetical index with table of contents and list
	 * @param {Array} list - The list of items to index
	 * @param {string} key - The property key to index by
	 */
	render(list, key) {
		const index = this.buildIndex(list, key);

		const toc = document.createElement("joblist-aindex-toc");
		toc.setAttribute("index", JSON.stringify(index));

		const listComponent = document.createElement("joblist-aindex-list");
		listComponent.setAttribute("index", JSON.stringify(index));

		if (this.template) {
			listComponent.append(this.template);
		}

		this.replaceChildren(toc, listComponent);
	}

	/**
	 * Builds an alphabetical index from a list of items
	 * @param {Array} list - The list of items to index
	 * @param {string} key - The property key to index by
	 * @returns {Object} Index object with letters as keys and arrays of items as values
	 */
	buildIndex(list, key) {
		return list.reduce((index, item) => {
			const char = key ? item[key][0] : item[0];
			const indexLetter = char.toLowerCase();
			index[indexLetter] = index[indexLetter] || [];
			index[indexLetter].push(item);
			return index;
		}, {});
	}

	/**
	 * Creates list item elements from index terms
	 * @param {Array} indexTerms - Array of terms to create list items for
	 * @returns {HTMLElement[]} Array of list item elements
	 */
	createListItems(indexTerms) {
		return indexTerms.map((term) => {
			const li = document.createElement("li");
			li.textContent = term;
			return li;
		});
	}
}

/**
 * Custom web component for displaying a table of contents for alphabetical index
 * @class JoblistAindexToc
 * @extends HTMLElement
 */
export class JoblistAindexToc extends HTMLElement {
	/**
	 * Gets the index data from the index attribute
	 * @returns {Object} Parsed index object
	 */
	get index() {
		return JSON.parse(this.getAttribute("index")) || {};
	}

	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	connectedCallback() {
		this.render(this.index);
	}

	/**
	 * Renders the table of contents with navigation links
	 * @param {Object} index - The index object with letters as keys
	 */
	render(index) {
		const indexItems = Object.keys(index)
			.sort(sortIndex)
			.map((indexLetter) => {
				const li = document.createElement("li");
				const anchor = document.createElement("a");
				anchor.setAttribute("href", `#aindex-${indexLetter}`);
				anchor.textContent = indexLetter;

				const countElement = document.createElement("joblist-aindex-count");
				countElement.textContent = `(${index[indexLetter].length})`;
				anchor.append(countElement);

				li.append(anchor);
				return li;
			});

		const ul = document.createElement("ul");
		ul.append(...indexItems);
		this.replaceChildren(ul);
	}
}

/**
 * Custom web component for displaying the alphabetical index list with sections
 * @class JoblistAindexList
 * @extends HTMLElement
 */
export class JoblistAindexList extends HTMLElement {
	/**
	 * Gets the index data from the index attribute
	 * @returns {Object} Parsed index object
	 */
	get index() {
		return JSON.parse(this.getAttribute("index")) || {};
	}

	/**
	 * Gets the template element for rendering list items
	 * @returns {HTMLTemplateElement} The template element
	 */
	get template() {
		return this.querySelector("template");
	}

	/**
	 * Gets the key attribute from the template
	 * @returns {string} The template key attribute value
	 */
	get templateKey() {
		return this.template?.getAttribute("key");
	}

	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	connectedCallback() {
		this.render(this.index);
	}

	/**
	 * Renders the alphabetical index list with sections for each letter
	 * @param {Object} index - The index object with letters as keys and arrays of items as values
	 */
	render(index) {
		const sections = Object.keys(index)
			.sort(sortIndex)
			.map((indexLetter) => {
				const section = document.createElement("section");
				section.setAttribute("id", `aindex-${indexLetter}`);

				const anchor = document.createElement("a");
				anchor.setAttribute("href", `#aindex-${indexLetter}`);
				anchor.textContent = indexLetter;

				const countElement = document.createElement("joblist-aindex-count");
				countElement.textContent = `(${index[indexLetter].length})`;

				const h2 = document.createElement("h2");
				h2.append(anchor, countElement);
				section.appendChild(h2);

				const ul = document.createElement("ul");
				const template = this.template;
				const templateKey = this.templateKey || "item";

				index[indexLetter].forEach((item) => {
					const li = document.createElement("li");
					if (template && template.content && template.content.firstChild) {
						const cloned = template.content.cloneNode(true);
						const target = cloned.firstChild;
						try {
							target.setAttribute(templateKey, JSON.stringify(item));
						} catch (_) {
							/* ignore template attribute set issues */
						}
						// Also support [data-item] text injection for simple templates
						const dataNode = cloned.querySelector?.("[data-item]");
						if (dataNode) {
							dataNode.textContent =
								typeof item === "string"
									? item
									: item.title || item.name || String(item);
						}

						li.appendChild(cloned);
					} else {
						li.textContent =
							typeof item === "string"
								? item
								: item.title || item.name || String(item);
					}
					ul.appendChild(li);
				});

				section.appendChild(ul);

				return section;
			});

		this.replaceChildren(...sections);
	}
}
