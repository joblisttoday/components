import apiSdk from "../libs/sdk-api.js";
import { companyToMapMarkers } from "../libs/map.js";

export default class JoblistCompany extends HTMLElement {
	get full() {
		return this.getAttribute("full") === "true";
	}
	get origin() {
		return this.getAttribute("origin") || "https://joblist.today";
	}
	get tagsOrigin() {
		return (
			this.getAttribute("tagsOrigin") ||
			"https://profiles.joblist.today/tags/companies"
		);
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
		return `${this.origin}/${slug}`;
	}
	buildTagUrl(tag) {
		return `${this.tagsOrigin}/${tag}`;
	}
	constructor() {
		super();
		this.sdk = apiSdk;
	}
	async connectedCallback() {
		if (this.slug) {
			this.company = await this.sdk.getCompany(this.slug);
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
					this.createLinks(this.company),
					this.createWidgets(this.company),
					this.createBoard(this.company),
				);
			} else {
				$doms.push(
					...this.createCardDoms(this.company),
					this.createDescription(this.company),
				);
			}
		}
		this.append(...$doms);
	}
	createCardDoms(company) {
		return [this.createTitle(this.company), this.createTags(this.company)];
	}
	createTitle({ slug, title }) {
		const $title = document.createElement("h1");
		$title.textContent = title;

		const $link = document.createElement("a");
		$link.setAttribute("href", this.buildProfileUrl(slug));

		$link.append($title);
		const $wrapper = document.createElement("joblist-company-title");
		$wrapper.append($link);
		return $wrapper;
	}
	createDescription({ description }) {
		if (!description) return "";
		const $wrapper = document.createElement("joblist-company-description");
		const $element = document.createElement("p");
		$element.textContent = description;
		$wrapper.append($element);
		return $wrapper;
	}
	createTags({ tags }) {
		if (!tags || !tags.length) return "";
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
		$element.textContent = tag;
		$element.setAttribute("href", this.buildTagUrl(tag));
		$wrapper.append($element);
		return $wrapper;
	}
	createLinks(company) {
		const companyLinks = ["company_url", "job_board_url", "wikipedia_url"];
		const socialLinks = [
			"twitter_url",
			"youtube_url",
			"facebook_url",
			"instagram_url",
		];

		const $wrapper = document.createElement("joblist-company-links");
		$wrapper.append(
			this.createLinksMenu(companyLinks, company),
			this.createLinksMenu(socialLinks, company),
		);
		return $wrapper;
	}
	createLinksMenu(links, company) {
		const $links = links.reduce((acc, linkKey) => {
			const $link = document.createElement("a");
			const linkVal = company[linkKey];
			if (linkVal) {
				$link.setAttribute("href", linkVal);
				$link.textContent = linkKey;
				acc.push($link);
			}
			return acc;
		}, []);
		if ($links) {
			const $listItems = $links.map(($link) => {
				const $li = document.createElement("li");
				$li.append($link);
				return $li;
			});
			const $menu = document.createElement("menu");
			$menu.append(...$listItems);
			return $menu;
		} else {
			return "";
		}
	}
	createWidgets(company) {
		const $widgets = document.createElement("joblist-company-widgets");
		$widgets.append(this.createHeatmap(company), this.createPositions(company));
		return $widgets;
	}
	createHeatmap({ slug, job_board_provider, job_board_hostname }) {
		if (!job_board_provider || !job_board_hostname) return;
		const $heatmap = document.createElement("joblist-heatmap");
		$heatmap.setAttribute("slug", slug);
		return $heatmap;
	}
	createPositions(company) {
		if (!company.positions) return "";
		const $map = document.createElement("joblist-map-list");
		$map.setAttribute("markers", JSON.stringify(companyToMapMarkers(company)));
		return $map;
	}
	createBoard({ job_board_provider, job_board_hostname }) {
		if (!job_board_provider || !job_board_hostname) return;
		const $board = document.createElement("joblist-board");
		$board.setAttribute("provider-name", job_board_provider);
		$board.setAttribute("provider-hostname", job_board_hostname);
		return $board;
	}
}
