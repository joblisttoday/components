class SearchResults extends HTMLElement {
	static get observedAttributes() {
		return ['results'];
	}

	get results() {
		const resultsAttr = this.getAttribute('results');
		return resultsAttr ? JSON.parse(resultsAttr) : {};
	}

	connectedCallback() {
		this._render();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'results') {
			this._render();
		}
	}

	_render() {
		this.textContent = '';
		const { companies, jobs } = this.results;

		if (companies && companies.length) {
			const companyHeader = document.createElement('h2');
			companyHeader.textContent = 'Companies:';
			this.appendChild(companyHeader);

			const companyColumns = companies[0].columns;
			for (const companyValues of companies[0].values) {
				const company = Object.fromEntries(companyColumns.map((column, index) => [column, companyValues[index]]));
				const companyEl = document.createElement('joblist-company');
				companyEl.setAttribute('name', company.title);
				companyEl.setAttribute('slug', company.slug);
				companyEl.setAttribute('description', company.description);
				this.appendChild(companyEl);
			}
		}

		if (jobs && jobs.length) {
			const jobHeader = document.createElement('h2');
			jobHeader.textContent = 'Jobs:';
			this.appendChild(jobHeader);

			const jobColumns = jobs[0].columns;
			for (const jobValues of jobs[0].values) {
				const job = Object.fromEntries(jobColumns.map((column, index) => [column, jobValues[index]]));
				const jobEl = document.createElement('joblist-job');
				jobEl.setAttribute('title', job.name);
				jobEl.setAttribute('company', job.company_title);
				jobEl.setAttribute('location', job.location);
				this.appendChild(jobEl);
			}
		}
	}
}

if (!customElements.get('joblist-search-results')) {
	customElements.define('joblist-search-results', SearchResults);
}
