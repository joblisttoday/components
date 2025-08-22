import joblistDuckDBSDK, { JoblistDuckDBSDK } from "../libs/sdk-duckdb.js";
import { companyToMapMarkers } from "../libs/map.js";
import text from "../utils/text.js";
import "giscus";
import "./social-widget.js";
import "./icon.js";
import "./tag.js";

/**
 * Custom web component for displaying detailed company information
 * @class JoblistCompany
 * @extends HTMLElement
 */
export default class JoblistCompany extends HTMLElement {
	/**
	 * Gets whether to display full company details
	 * @returns {boolean} True if full details should be shown
	 */
	get full() {
		return this.getAttribute("full") === "true";
	}
	
	/**
	 * Gets the origin URL for building links
	 * @returns {string} The origin URL
	 */
	get origin() {
		return this.getAttribute("origin") || "https://joblist.today";
	}
	
	/**
	 * Gets the company ID
	 * @returns {string} The company ID
	 */
	get companyId() {
		return this.getAttribute("company-id");
	}
	
	/**
	 * Gets the company data object
	 * @returns {Object} Parsed company data object
	 */
	get company() {
		return JSON.parse(this.getAttribute("company") || {});
	}
	
	/**
	 * Sets the company data object
	 * @param {Object} obj - Company data object
	 */
	set company(obj) {
		this.setAttribute("company", JSON.stringify(obj));
	}
	/**
	 * Builds profile URL for a company ID
	 * @param {string} id - Company ID
	 * @returns {string} Complete profile URL
	 */
	buildProfileUrl(id) {
		return `${this.origin}/${id}`;
	}
	
	/**
	 * Lifecycle method called when element is connected to DOM
	 */
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
	/**
	 * Renders the company component with appropriate level of detail
	 */
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
		
		// Add notes section if in full mode
		if (this.full) {
			$doms.push(this.createNotesSection(this.company));
		}
		
		this.append(...$doms);
	}
	/**
	 * Creates basic card DOM elements for the company
	 * @param {Object} company - Company data object
	 * @returns {HTMLElement[]} Array of card DOM elements
	 */
	createCardDoms(company) {
		const doms = [
			this.createTitle(this.company),
			this.createTags(this.company),
		];
		return doms;
	}
	/**
	 * Creates company title element with link and favicon
	 * @param {Object} param0 - Company data object destructured
	 * @param {string} param0.id - Company ID
	 * @param {string} param0.title - Company title
	 * @param {Object} param0.company - Rest of company data
	 * @returns {HTMLElement} Title wrapper element
	 */
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
	/**
	 * Creates favicon element from company URL
	 * @param {Object} param0 - Object with company URL
	 * @param {string} param0.company_url - Company website URL
	 * @returns {HTMLElement} Favicon element
	 */
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
	/**
	 * Creates company description element
	 * @param {Object} param0 - Object with description
	 * @param {string} param0.description - Company description
	 * @returns {HTMLElement|string} Description element or empty string
	 */
	createDescription({ description }) {
		if (!description) return "";
		const $wrapper = document.createElement("joblist-company-description");
		const $element = document.createElement("p");
		$element.textContent = description;
		$wrapper.append($element);
		return $wrapper;
	}
	/**
	 * Creates tags container element
	 * @param {Object} param0 - Object with tags array
	 * @param {Array} param0.tags - Array of tag objects
	 * @returns {HTMLElement|string} Tags wrapper or empty string
	 */
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
	/**
	 * Creates individual tag element
	 * @param {Object} tag - Tag data object
	 * @returns {HTMLElement} Tag element
	 */
	createTag(tag) {
		const $tag = document.createElement("joblist-tag");
		$tag.setAttribute("tag", JSON.stringify(tag));
		return $tag;
	}
	/**
	 * Creates links section with company, social, and edit links
	 * @param {Object} company - Company data object
	 * @returns {HTMLElement} Links wrapper element
	 */
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

		// Favorite button as separate menu in full mode
		const favoriteButton = this.full ? this.createFavoriteMenu(company) : null;

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

		// Add favorite button if in full mode
		if (favoriteButton) {
			menus.push(favoriteButton);
		}

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
	/**
	 * Creates a menu of links from link configuration
	 * @param {Array} links - Array of link objects or strings
	 * @param {Object} company - Company data object
	 * @returns {HTMLElement|string} Menu element or empty string
	 */
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

	/**
	 * Creates widgets section with positions, social, and heatmap
	 * @param {Object} company - Company data object
	 * @returns {HTMLElement} Widgets wrapper element
	 */
	createWidgets(company) {
		const $widgets = document.createElement("joblist-company-widgets");
		$widgets.append(
			this.createPositions(company),
			this.createSocialWidget(company),
			this.createHeatmap(company),
		);
		return $widgets;
	}
	/**
	 * Creates heatmap widget for company job postings
	 * @param {Object} param0 - Company data destructured
	 * @param {string} param0.id - Company ID
	 * @param {string} param0.job_board_provider - Job board provider
	 * @param {string} param0.job_board_hostname - Job board hostname
	 * @returns {HTMLElement|string} Heatmap element or empty string
	 */
	createHeatmap({ id, job_board_provider, job_board_hostname }) {
		if (!job_board_provider || !job_board_hostname) return "";
		const $heatmap = document.createElement("joblist-heatmap");
		$heatmap.setAttribute("company-id", id);
		return $heatmap;
	}
	/**
	 * Creates map positions widget from company data
	 * @param {Object} company - Company data object
	 * @returns {HTMLElement|string} Map list element or empty string
	 */
	createPositions(company) {
		// Build markers first; render map only if there are markers
		const markers = companyToMapMarkers(company) || [];
		if (!markers.length) return "";
		const $map = document.createElement("joblist-map-list");
		$map.setAttribute("markers", JSON.stringify(markers));
		return $map;
	}
	/**
	 * Creates social media widget if company has social links
	 * @param {Object} company - Company data object
	 * @returns {HTMLElement|string} Social widget or empty string
	 */
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
	/**
	 * Creates job board component for the company
	 * @param {Object} param0 - Company data destructured
	 * @param {string} param0.job_board_provider - Job board provider
	 * @param {string} param0.job_board_hostname - Job board hostname
	 * @returns {HTMLElement|string} Board element or empty string
	 */
	createBoard({ job_board_provider, job_board_hostname }) {
		if (!job_board_provider || !job_board_hostname) return "";
		const $board = document.createElement("joblist-board");
		$board.setAttribute("provider-name", job_board_provider);
		$board.setAttribute("provider-hostname", job_board_hostname);
		return $board;
	}

	/**
	 * Creates Giscus comments widget
	 * @returns {HTMLElement} Giscus wrapper element
	 */
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
	/**
	 * Creates highlight indicator for highlighted companies
	 * @param {Object} company - Company data object
	 * @returns {HTMLElement} Highlight element
	 */
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

	/**
	 * Creates favorite button menu
	 * @param {Object} company - Company data object
	 * @returns {HTMLElement} Favorite menu element
	 */
	createFavoriteMenu(company) {
		const $menu = document.createElement("joblist-company-menu");
		const $favoriteBtn = document.createElement("joblist-favorite-button");
		$favoriteBtn.setAttribute("item-id", company.id);
		$favoriteBtn.setAttribute("item-type", "company");
		$menu.appendChild($favoriteBtn);
		return $menu;
	}

	/**
	 * Creates notes editor section
	 * @param {Object} company - Company data object
	 * @returns {HTMLElement} Notes section element
	 */
	createNotesSection(company) {
		const $section = document.createElement("section");
		const $header = document.createElement("h3");
		$header.textContent = "Notes";
		
		const $notesEditor = document.createElement("joblist-notes-editor");
		$notesEditor.setAttribute("item-id", company.id);
		$notesEditor.setAttribute("item-type", "company");
		
		$section.appendChild($header);
		$section.appendChild($notesEditor);
		return $section;
	}

	/**
	 * Creates highlight purchase menu
	 * @param {Object} company - Company data object
	 * @returns {HTMLElement} Highlight menu element
	 */
	createHighlightMenu(company) {
		// Create a simple link to your existing pricing table with company ID parameter
		const highlightOptions = [
			{
				key: "highlight_company",
				icon: "star",
				label: "highlight",
				href: `https://components.joblist.today/apps/pricing-table/?company=${company.id}`,
				title: `Highlight ${company.title} for a month`,
			},
		];

		return this.createLinksMenu(highlightOptions, company);
	}
}
