class Job extends HTMLElement {
	connectedCallback() {
		this._render();
	}

	_render() {
		this.textContent = '';
		const titleEl = document.createElement('div');
		titleEl.textContent = `Title: ${this.getAttribute('title')}`;
		this.appendChild(titleEl);

		const companyEl = document.createElement('div');
		companyEl.textContent = `Company: ${this.getAttribute('company')}`;
		this.appendChild(companyEl);

		const locationEl = document.createElement('div');
		locationEl.textContent = `Location: ${this.getAttribute('location')}`;
		this.appendChild(locationEl);
	}
}

if (!customElements.get('joblist-job')) {
	customElements.define('joblist-job', Job);
}
