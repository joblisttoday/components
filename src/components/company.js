import githubSdk from "../libs/sdk-github.js";

export default class JoblistCompany extends HTMLElement {
	static get observedAttributes() {
		return ["slug", "company"];
	}
	get slug() {
		return this.getAttribute("slug");
	}
	get company() {
		return JSON.parse(this.getAttribute("company"));
	}
	set company(obj) {
		this.setAttribute("company", JSON.stringify(obj));
	}
	buildProfileUrl(slug) {
		return `https://profiles.joblist.today/companies/${slug}`;
	}
	buildTagUrl(tag) {
		return `https://profiles.joblist.today/tags/${tag}`;
	}
	constructor() {
		super();
		this.sdk = githubSdk;
	}
	async connectedCallback() {
		if (this.slug) {
			this.company = await this.sdk.fetchCompany(this.slug);
			console.log("company", this.company);
		}
		this.render();
	}
	render() {
		const $doms = [];
		if (!this.company) {
			$doms.push(`No company ${slug}`);
		} else {
			if (this.full) {
				$doms.push(
					...this.createCardDoms(this.company),
					this.createDescription(this.company),
				);
			} else {
				$doms.push(...this.createCardDoms(this.company));
			}
		}
		this.append(...$doms);
	}
	createCardDoms(company) {
		return [
			this.createTitle(this.company),
			this.createSlug(this.company),
			this.createTags(this.company),
			this.createShortDescription(this.company),
		];
	}
	createTitle({ title }) {
		const $wrapper = document.createElement("joblist-company-title");
		const $element = document.createElement("h1");
		$element.textContent = title;
		$wrapper.append($element);
		return $wrapper;
	}
	createSlug({ slug }) {
		const $wrapper = document.createElement("joblist-company-slug");
		const $element = document.createElement("a");
		$element.textContent = `@${slug}`;
		$element.setAttribute("href", this.buildProfileUrl(slug));
		$wrapper.append($element);
		return $wrapper;
	}
	createShortDescription(company) {
		return this.createDescription({
			...company,
			description: company?.description.slice(0, 140),
		});
	}
	createDescription({ description }) {
		if (!description) return;
		const $wrapper = document.createElement("joblist-company-description");
		const $element = document.createElement("p");
		$element.textContent = description;
		$wrapper.append($element);
		return $wrapper;
	}
	createTags({ tags }) {
		if (!tags || !tags.length) return;
		const $wrapper = document.createElement("joblist-company-tags");
		const $menu = document.createElement("menu");
		$menu.append(
			...tags.map(this.createTag.bind(this)).map(($el) => {
				const $li = document.createElement("li");
				$li.append($el);
				return $li;
			}),
		);
		$wrapper.append($menu);
		return $wrapper;
	}
	createTag(tag) {
		const $wrapper = document.createElement("joblist-company-tag");
		const $element = document.createElement("a");
		$element.textContent = `#${tag}`;
		$element.setAttribute("href", this.buildTagUrl(tag));
		$wrapper.append($element);
		return $wrapper;
	}
}
