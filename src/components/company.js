import joblistDuckDBSDK, { JoblistDuckDBSDK } from "../libs/sdk-duckdb.js";
import { companyToMapMarkers } from "../libs/map.js";
import text from "../utils/text.js";
import "giscus";

export default class JoblistCompany extends HTMLElement {
	get full() {
		return this.getAttribute("full") === "true";
	}
	get origin() {
		return this.getAttribute("origin") || "https://joblist.today";
	}
	get companyId() {
		return this.getAttribute("company-id");
	}
	get company() {
		return JSON.parse(this.getAttribute("company") || {});
	}
	set company(obj) {
		this.setAttribute("company", JSON.stringify(obj));
	}
	buildProfileUrl(id) {
		return `${this.origin}/${id}`;
	}
	async connectedCallback() {
		if (this.companyId) {
            const base = this.getAttribute("parquet-base") || undefined;
            const mode = this.getAttribute("parquet-mode") || "buffer";
            this.sdk = base || mode ? new JoblistDuckDBSDK(base, { mode }) : joblistDuckDBSDK;
			await this.sdk.initialize();
			this.company = await this.sdk.getCompany(this.companyId);
		}
		this.render();
	}
	render() {
		const $doms = [];
		if (!this.company) {
			$doms.push(`No company ${this.companyId}`);
		} else {
			if (this.full) {
				$doms.push(
					...this.createCardDoms(this.company),
					this.createDescription(this.company),
					this.createLinks(this.company),
					this.createWidgets(this.company),
					this.createEdit(this.company),
					this.createGiscus(),
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
		const doms = [
			this.createTitle(this.company),
			this.createTags(this.company),
		];
		return doms;
	}
	createTitle({ id, title, ...company }) {
		const $title = document.createElement("h1");
		$title.textContent = title;

		const $link = document.createElement("a");
		$link.setAttribute("href", this.buildProfileUrl(id));

		$link.append($title);
		const $wrapper = document.createElement("joblist-company-title");
		$wrapper.append($link);
		if (company?.is_highlighted) {
			$wrapper.append(this.createHighlight(this.company));
		}
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
		const $tag = document.createElement("joblist-tag");
		$tag.setAttribute("tag", JSON.stringify(tag));
		return $tag;
	}
	createLinks(company) {
		const companyLinks = ["company_url", "job_board_url", "wikipedia_url"];
		const socialLinks = [
			"linkedin_url",
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
				$link.setAttribute("target", "_blank");
				$link.setAttribute("title", linkKey.split("_").join(" "));
				$link.setAttribute("rel", "noreferrer noopener");
				$link.textContent = text(linkKey);
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
		$widgets.append(this.createPositions(company), this.createHeatmap(company));
		return $widgets;
	}
	createHeatmap({ id, job_board_provider, job_board_hostname }) {
		if (!job_board_provider || !job_board_hostname) return "";
		const $heatmap = document.createElement("joblist-heatmap");
		$heatmap.setAttribute("company-id", id);
		return $heatmap;
	}
	createPositions(company) {
		// Build markers first; render map only if there are markers
		const markers = companyToMapMarkers(company) || [];
		if (!markers.length) return "";
		const $map = document.createElement("joblist-map-list");
		$map.setAttribute("markers", JSON.stringify(markers));
		return $map;
	}
	createBoard({ job_board_provider, job_board_hostname }) {
		if (!job_board_provider || !job_board_hostname) return "";
		const $board = document.createElement("joblist-board");
		$board.setAttribute("provider-name", job_board_provider);
		$board.setAttribute("provider-hostname", job_board_hostname);
		return $board;
	}
	createEdit({ id }) {
		const editLinks = [
			{
				text: "edit",
				href: `https://edit.joblist.today/#/collections/companies/entries/${id}/index`,
				title: "Edit with a github account in netlify-cms",
			},
			{
				text: "file",
				href: `https://github.com/joblisttoday/data/edit/main/companies/${id}/index.json`,
				title: "Edit with github directly",
			},
			{
				text: "delete",
				href: `https://github.com/joblisttoday/data/issues/new?labels=delete-company&template=delete_company.yml&title=%5Bdelete%5D+${id}`,
				title: "Request company deletion",
			},
			{
				text: "issue",
				href: `https://github.com/joblisttoday/data/issues/new?labels=update-company&template=update_company.yml&title=%5Bupdate%5D+${id}`,
				title: "New issue to update or dissuss this company",
			},
		];

		const links = editLinks.map((linkInfo) => {
			const { text, href, title } = linkInfo;
			const listItem = document.createElement("li");
			const anchor = document.createElement("a");
			anchor.textContent = text;
			anchor.setAttribute("href", href);
			anchor.setAttribute("title", title);
			anchor.setAttribute("target", "_blank");
			anchor.setAttribute("rel", "noreferrer noopener");
			listItem.appendChild(anchor);
			return listItem;
		});
		const menu = document.createElement("menu");
		menu.append(...links);

		const details = document.createElement("details");
		const summary = document.createElement("summary");
		summary.textContent = "Edit";
		details.append(summary, menu);

		const edit = document.createElement("joblist-company-edit");
		edit.append(details);
		return edit;
	}
	createGiscus() {
		const giscus = document.createElement("giscus-widget");
		giscus.setAttribute("id", "comments");
		giscus.setAttribute("repo", "joblisttoday/data");
		giscus.setAttribute("repoid", "MDEwOlJlcG9zaXRvcnkzMDA2ODcyNDc");
		giscus.setAttribute("category", "Companies");
		giscus.setAttribute("categoryid", "DIC_kwDOEewfj84CTgrN");
		giscus.setAttribute("mapping", "pathname");
		giscus.setAttribute("strict", "1");
		giscus.setAttribute("reactionsenabled", "1");
		giscus.setAttribute("emitmetadata", "0");
		giscus.setAttribute("inputposition", "top");
		giscus.setAttribute("theme", "preferred_color_scheme");
		giscus.setAttribute("lang", "en");
		giscus.setAttribute("loading", "lazy");

		const details = document.createElement("details");
		const summary = document.createElement("summary");
		summary.textContent = "Discussion";
		details.append(summary, giscus);
		const wrapper = document.createElement("joblist-giscus");
		wrapper.append(details);
		return wrapper;
	}
	createHighlight(company) {
		const highlighted = document.createElement("joblist-highlight");
		highlighted.setAttribute("type", "company");
		highlighted.setAttribute("text", company.title);
		highlighted.setAttribute(
			"title",
			`${company.title} is currently highlighted`,
		);
		return highlighted;
	}
}
