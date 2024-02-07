export default class JoblistCompany extends HTMLElement {
	static get observedAttributes() {
		return [
			"slug",
			"title",
			"created_at",
			"updated_at",
			"company_url",
			"job_board_url",
			"job_board_provider",
			"job_board_hostname",
			"tags",
			"description",
			"twitter_url",
			"linkedin_url",
			"youtube_url",
			"instagram_url",
			"facebook_url",
			"github_url",
			"wikipedia_url",
			"positions",
		];
	}
	get attributesToRender() {
		return ["title", "description", "tags"];
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
		this.innerHTML = "";
		const attributes = this.getAttributeNames();
		this.attributesToRender
			.map((attrName) => {
				const attrValue = this.getAttribute(attrName);
				const element = document.createElement(`joblist-company-${attrName}`);
				const slug = this.getAttribute("slug");
				if (attrName === "title") {
					const link = document.createElement("a");
					link.href = `https://profiles.joblist.today/companies/${slug}`;
					link.target = "_blank";
					link.textContent = attrValue;
					element.appendChild(link);
				} else if (attrName === "tags") {
					const tags = JSON.parse(attrValue) || [];
					tags.map((tag) => {
						const tagLink = document.createElement("a");
						tagLink.href = `https://profiles.joblist.today/tags/companies/${tag}`;
						tagLink.target = "_blank";
						tagLink.textContent = tag;
						element.appendChild(tagLink);
					});
				} else {
					element.textContent = attrValue;
				}
				return element;
			})
			.forEach((el) => this.appendChild(el));
	}
}
