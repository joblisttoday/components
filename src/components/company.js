import joblistDuckDBSDK, { JoblistDuckDBSDK } from "../libs/sdk-duckdb.js";
import { companyToMapMarkers } from "../libs/map.js";
import text from "../utils/text.js";
import "giscus";
import "./social-widget.js";
import "./icon.js";
import "./tag.js";

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
			this.sdk =
				base || mode ? new JoblistDuckDBSDK(base, { mode }) : joblistDuckDBSDK;
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
					// this.createGiscus(),
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

		// Create header container with title and edit menu
		const $header = document.createElement("div");
		$header.className = "company-header";
		$header.append($link);

		const $wrapper = document.createElement("joblist-company-title");
		$wrapper.append(this.createFavicon(this.company));
		$wrapper.append($header);

		if (company?.is_highlighted) {
			$wrapper.append(this.createHighlight(this.company));
		}
		return $wrapper;
	}
	createFavicon({ company_url }) {
		const $favicon = document.createElement("joblist-company-favicon");
		if (!company_url) return "";
		try {
			const url = new URL(company_url);
			const $img = document.createElement("img");
			$img.src = `https://icons.duckduckgo.com/ip2/${url.hostname}.ico`;
			$img.setAttribute("loading", "lazy");
			$favicon.append($img);
		} catch (err) {
			console.warn(err);
		}
		return $favicon;
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
		const companyLinks = [
			{ key: "company_url", icon: "globe", label: "homepage" },
			{ key: "job_board_url", icon: "briefcase", label: "careers" },
			{ key: "wikipedia_url", icon: "wikipedia", label: "wikipedia" },
		];

		const socialLinks = [
			{ key: "linkedin_url", icon: "linkedin", label: "linkedin" },
			{ key: "twitter_url", icon: "twitter", label: "twitter" },
			{ key: "youtube_url", icon: "youtube", label: "youtube" },
			{ key: "facebook_url", icon: "facebook", label: "facebook" },
			{ key: "instagram_url", icon: "instagram", label: "instagram" },
		];

		// Edit options as separate third menu if in full mode
		const editOptions = this.full
			? [
					{
						key: "edit_cms",
						icon: "edit",
						label: "edit",
						href: `https://edit.joblist.today/#/collections/companies/entries/${company.id}/index`,
						title: "Edit with a github account in netlify-cms",
					},
					{
						key: "edit_file",
						icon: "file",
						label: "file",
						href: `https://github.com/joblisttoday/data/edit/main/companies/${company.id}/index.json`,
						title: "Edit with github directly",
					},
					{
						key: "edit_delete",
						icon: "trash",
						label: "delete",
						href: `https://github.com/joblisttoday/data/issues/new?labels=delete-company&template=delete_company.yml&title=%5Bdelete%5D+${company.id}`,
						title: "Request company deletion",
					},
					{
						key: "edit_issue",
						icon: "issue",
						label: "issue",
						href: `https://github.com/joblisttoday/data/issues/new?labels=update-company&template=update_company.yml&title=%5Bupdate%5D+${company.id}`,
						title: "New issue to update or discuss this company",
					},
				]
			: [];

		const $wrapper = document.createElement("joblist-company-links");

		// Create three separate menus
		const menus = [
			this.createLinksMenu(companyLinks, company),
			this.createLinksMenu(socialLinks, company),
		];

		// Add edit menu as third menu if in full mode
		if (this.full && editOptions.length > 0) {
			menus.push(this.createLinksMenu(editOptions, company));
		}

		// Add highlight button if in full mode and not already highlighted
		if (this.full && !company.is_highlighted) {
			menus.push(this.createHighlightMenu(company));
		}

		$wrapper.append(...menus.filter(Boolean));
		return $wrapper;
	}
	createLinksMenu(links, company) {
		const $links = links.reduce((acc, linkInfo) => {
			// Handle both old string format and new object format
			const linkKey = typeof linkInfo === "string" ? linkInfo : linkInfo.key;
			const icon = typeof linkInfo === "object" ? linkInfo.icon : null;
			const label =
				typeof linkInfo === "object" ? linkInfo.label : text(linkKey);
			const href =
				typeof linkInfo === "object" && linkInfo.href
					? linkInfo.href
					: company[linkKey];
			const title =
				typeof linkInfo === "object" && linkInfo.title ? linkInfo.title : label;

			// Skip if no URL (for company properties) or if it's an edit option with href
			if (!href) return acc;

			const $link = document.createElement("a");
			$link.setAttribute("href", href);
			$link.setAttribute("target", "_blank");
			$link.setAttribute("title", title);
			$link.setAttribute("rel", "noreferrer noopener");

			// Add icon if provided
			if (icon) {
				const iconElement = document.createElement("joblist-icon");
				iconElement.setAttribute("icon", icon);
				iconElement.setAttribute("size", "small");
				$link.appendChild(iconElement);

				const textSpan = document.createElement("span");
				textSpan.textContent = label;
				$link.appendChild(textSpan);
			} else {
				$link.textContent = label;
			}

			acc.push($link);
			return acc;
		}, []);

		if ($links.length > 0) {
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
		$widgets.append(
			this.createPositions(company),
			this.createSocialWidget(company),
			this.createHeatmap(company),
		);
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
	createSocialWidget(company) {
		const socialLinks = [
			"wikipedia_url",
			"linkedin_url",
			"twitter_url",
			"youtube_url",
			"facebook_url",
			"instagram_url",
		];

		const hasSocialLinks = socialLinks.some((linkKey) => company[linkKey]);
		if (!hasSocialLinks) return "";

		const $socialWidget = document.createElement("joblist-social-widget");
		$socialWidget.setAttribute("company", JSON.stringify(company));
		return $socialWidget;
	}
	createBoard({ job_board_provider, job_board_hostname }) {
		if (!job_board_provider || !job_board_hostname) return "";
		const $board = document.createElement("joblist-board");
		$board.setAttribute("provider-name", job_board_provider);
		$board.setAttribute("provider-hostname", job_board_hostname);
		return $board;
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
		summary.textContent = "Giscuss";
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
	
	createHighlightMenu(company) {
		// Create a simple link to your existing pricing table with company ID parameter
		const highlightOptions = [
			{
				key: "highlight_company",
				icon: "star", 
				label: "highlight",
				href: `https://components.joblist.today/apps/pricing-table/?company=${company.id}`,
				title: `Highlight ${company.title} for €50 (31 days)`,
			}
		];

		return this.createLinksMenu(highlightOptions, company);
	}
}
