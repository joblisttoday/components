function formatDate(date) {
	const options = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	};
	if (isNaN(date.getTime())) { // Check if the date is valid
		return "Invalid date";
	} else {
		return new Intl.DateTimeFormat(navigator.language, options).format(date);
	}
}
function timeSince(inputDate) {
	const date = new Date(inputDate);
	if (isNaN(date.getTime())) {
		return "";
	}
	
	const now = new Date();
	const secondsPast = Math.floor((now - date) / 1000);
	if (secondsPast < 60) {
		return `${secondsPast} seconds ago`;
	}
	const minutesPast = Math.floor(secondsPast / 60);
	if (minutesPast < 60) {
		return `${minutesPast} minutes ago`;
	}
	const hoursPast = Math.floor(minutesPast / 60);
	if (hoursPast < 24) {
		return `${hoursPast} hours ago`;
	}
	const daysPast = Math.floor(hoursPast / 24);
	if (daysPast < 7) {
		return `${daysPast} days ago`;
	}
	const weeksPast = Math.floor(daysPast / 7);
	if (weeksPast < 4) {
		return `${weeksPast} weeks ago`;
	}
	const monthsPast = Math.floor(daysPast / 30);
	if (monthsPast < 12) {
		return `${monthsPast} months ago`;
	}
	const yearsPast = Math.floor(daysPast / 365);
	return `${yearsPast} years ago`;
}

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
		const companySlug = this.getAttribute('company_slug')
		this.attributesToRender.map(attrName => {
			const attrValue = this.getAttribute(attrName);
			const element = document.createElement(`joblist-job-${attrName}`);
			if (attrName === 'name') {
				const href = this.getAttribute('url') || 'https://matrix.to/#/#joblisttoday:matrix.org'
				const link = document.createElement('a');
				link.href = href;
				link.target = '_blank';
				link.textContent = attrValue;
				element.appendChild(link);
			} else if (attrName === 'published_date') {
				if (attrValue) {
					try {
						const dateValue = new Date(attrValue);
						console.log('date', attrValue, dateValue)
						element.textContent = timeSince(dateValue);
					} catch(e) {
						element.textContent = attrValue;
					}
				}
			} else if (attrName === 'company_title') {
				const href = `https://profiles.joblist.today/companies/${companySlug}`
				const link = document.createElement('a');
				link.href = href;
				link.target = '_blank';
				link.textContent = companySlug;
				element.appendChild(link);
			} else {
				element.textContent = attrValue;
			}
			this.appendChild(element);
		});
	}
}

if (!customElements.get('joblist-job')) {
	customElements.define('joblist-job', Job);
}
