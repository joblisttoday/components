// Function to sort index
export function sortIndex(a, b) {
	return a > b;
}

export default class JoblistAindex extends HTMLElement {
	get index() {
		return JSON.parse(this.getAttribute("index"))
	}
	get key() {
		return this.getAttribute('key');
	}
	get template() {
		return this.querySelector("template")
	}
	connectedCallback() {
		this.render(this.index, this.key);
	}
	render(list, key) {
		const index = this.buildIndex(list, key);

		const toc = document.createElement('joblist-aindex-toc');
		toc.setAttribute('index', JSON.stringify(index));

		const listComponent = document.createElement('joblist-aindex-list');
		listComponent.setAttribute('index', JSON.stringify(index));

		if (this.template) {
			listComponent.append(this.template)
		}

		this.replaceChildren(toc, listComponent);
	}

	buildIndex(list, key) {
		return list.reduce((index, item) => {
			const char = key ? item[key][0] : item[0]
			const indexLetter = char.toLowerCase();
			index[indexLetter] = index[indexLetter] || [];
			index[indexLetter].push(item);
			return index;
		}, {});
	}

	createListItems(indexTerms) {
		return indexTerms.map(term => {
			const li = document.createElement('li');
			li.textContent = term;
			return li;
		});
	}
}

export class JoblistAindexToc extends HTMLElement {
	get index() {
		return JSON.parse(this.getAttribute('index')) || {};
	}
	connectedCallback() {
		this.render(this.index);
	}
	render(index) {
		const indexItems = Object.keys(index).sort(sortIndex).map(indexLetter => {
			const li = document.createElement('li');
			const anchor = document.createElement('a');
			anchor.setAttribute("href", `#aindex-${indexLetter}`)
			anchor.textContent = indexLetter
			li.append(anchor)
			return li;
		});

		const ul = document.createElement('ul');
		ul.append(...indexItems)
		this.replaceChildren(ul);
	}
}

export class JoblistAindexList extends HTMLElement {
	get index() {
		return JSON.parse(this.getAttribute('index')) || {};
	}
	get template() {
		return this.querySelector("template")
	}
	get templateKey() {
		return this.template?.getAttribute("key")
	}
	connectedCallback() {
		this.render(this.index);
	}

	render(index) {
		const sections = Object.keys(index).sort(sortIndex).map(indexLetter => {
			const section = document.createElement('section');
			section.setAttribute('id', `aindex-${indexLetter}`);

			const anchor = document.createElement('a');
			anchor.setAttribute("href", `#aindex-${indexLetter}`)
			anchor.textContent = indexLetter
			const h2 = document.createElement('h2');
			h2.append(anchor)
			section.appendChild(h2);

			const ul = document.createElement('ul');
			const templateKey = this.templateKey;

			const template = this.template;

			index[indexLetter].forEach(item => {
				const li = document.createElement('li');
				const clonedTemplate = template.content.cloneNode(true);
				clonedTemplate.firstChild.setAttribute(templateKey, JSON.stringify(item));
				li.appendChild(clonedTemplate);
				ul.appendChild(li);
			});

			section.appendChild(ul);

			return section;
		});

		this.replaceChildren(...sections);
	}
}
