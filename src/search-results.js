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
			const companyColumns = companies[0].columns;
			for (const companyValues of companies[0].values) {
				const companyEl = document.createElement('joblist-company');
				companyColumns.forEach((column, index) => {
					companyEl.setAttribute(column, companyValues[index]);
				});
				this.appendChild(companyEl);
			}
		}

		if (jobs && jobs.length) {
			const jobColumns = jobs[0].columns;
			for (const jobValues of jobs[0].values) {
				const jobEl = document.createElement('joblist-job');
				jobColumns.forEach((column, index) => {
					jobEl.setAttribute(column, jobValues[index]);
				});
				this.appendChild(jobEl);
			}
		}
	}
}

if (!customElements.get('joblist-results')) {
	customElements.define('joblist-results', SearchResults);
}
