class Job extends HTMLElement {
	static get observedAttributes() {
		return [
			'objectID',
			'name',
			'url',
			'location',
			'published_date',
			'company_slug',
			'company_title'
		];
	}

	get attributesToRender() {
		return ['company_title', 'name', 'location', 'published_date']
	}

	connectedCallback() {
		this._render();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue !== newValue) {
			this._render();
		}
	}

	_render() {
		this.textContent = '';
		const attributes = this.getAttributeNames();
		const slug = this.getAttribute('company_slug')
		this.attributesToRender.map(attrName => {
			const attrValue = this.getAttribute(attrName);
			const element = document.createElement(`joblist-job-${attrName.replace('_', '-')}`);
			if (attrName === 'name') {
				const href = this.getAttribute('url') || 'https://matrix.to/#/#joblisttoday:matrix.org'
				const link = document.createElement('a');
				link.href = href;
				link.target = '_blank';
				link.textContent = attrValue;
				element.appendChild(link);
			} else if (attrName === 'published_date') {
				element.textContent = new Date(attrValue);
			} else if (attrName === 'company_title') {
				const href = `https://profiles.joblist.today/companies/${slug}`
				const link = document.createElement('a');
				link.href = href;
				link.target = '_blank';
				link.textContent = attrValue;
				element.appendChild(link);
			} else {
				element.textContent = attrValue;
			}
			return element
		}).forEach(el => this.appendChild(el))
	}
}

if (!customElements.get('joblist-job')) {
	customElements.define('joblist-job', Job);
}
