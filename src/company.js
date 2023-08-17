class Company extends HTMLElement {
	connectedCallback() {
		this._render();
	}

	_render() {
		this.textContent = '';
		const nameEl = document.createElement('div');
		nameEl.textContent = `Name: ${this.getAttribute('name')}`;
		this.appendChild(nameEl);

		const slugEl = document.createElement('div');
		slugEl.textContent = `Slug: ${this.getAttribute('slug')}`;
		this.appendChild(slugEl);

		const descriptionEl = document.createElement('div');
		descriptionEl.textContent = `Description: ${this.getAttribute('description')}`;
		this.appendChild(descriptionEl);
	}
}

if (!customElements.get('joblist-company')) {
	customElements.define('joblist-company', Company);
}
