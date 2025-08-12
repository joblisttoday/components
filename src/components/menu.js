import "./icon.js";

const MENUS = [
	[
		{
			href: "https://joblist.today",
			textContent: "home",
			icon: "home",
		},
		{
			href: "https://components.joblist.today/apps/search",
			textContent: "search",
			icon: "search",
		},
		{
			href: "https://components.joblist.today/apps/map",
			textContent: "map",
			icon: "map",
		},
		{
			href: "https://components.joblist.today/apps/companies",
			textContent: "companies",
			icon: "building",
		},
		{
			href: "https://components.joblist.today/apps/tags",
			textContent: "tags",
			icon: "tag",
		},
	],
	[
		{
			href: "https://edit.joblist.today",
			textContent: "edit data",
			icon: "edit",
		},
		{
			href: "https://edit.joblist.today/#/collections/companies/new",
			textContent: "new company",
			icon: "plus",
		},
		/* {
			 href: "https://edit.joblist.today/#/collections/tags/new",
			 textContent: "new tag",
			 }, */
	],
	[
		{
			href: "https://api.joblist.today",
			textContent: "api",
			icon: "code",
		},
		{
			href: "https://components.joblist.today/apps/boards",
			textContent: "providers",
			icon: "briefcase",
		},
		{
			href: "https://dashboards.joblist.today/",
			textContent: "dashboards",
			icon: "chart",
		},
		{
			href: "https://sqlime.org/#https://workers.joblist.today/joblist.db",
			textContent: "db.sqlite",
			icon: "database",
		},
		{
			href: "https://shell.duckdb.org/#queries=v0,INSTALL-httpfs~,LOAD-httpfs~,INSTALL-fts~,LOAD-fts~,CREATE-VIEW-companies-AS-SELECT-*-FROM-'https%3A%2F%2Fworkers.joblist.today%2Fcompanies.parquet'~,CREATE-VIEW-jobs-AS-SELECT-*-FROM-'https%3A%2F%2Fworkers.joblist.today%2Fjobs.parquet'~,CREATE-VIEW-companies_analyze-AS-SELECT-*-FROM-'https%3A%2F%2Fworkers.joblist.today%2Fcompanies_analyze.parquet'~,CREATE-VIEW-jobs_analyze-AS-SELECT-*-FROM-'https%3A%2F%2Fworkers.joblist.today%2Fjobs_analyze.parquet'~,CREATE-VIEW-companies_fts-AS-SELECT-*-FROM-'https%3A%2F%2Fworkers.joblist.today%2Fcompanies_fts.parquet'~,CREATE-VIEW-jobs_fts-AS-SELECT-*-FROM-'https%3A%2F%2Fworkers.joblist.today%2Fjobs_fts.parquet'~,SHOW-TABLES~,SELECT-job_board_url-FROM-companies-WHERE-is_highlighted-=-TRUE",
			textContent: "db.duckdb",
			icon: "database",
		},
	],
	[
		{
			href: "https://github.com/joblisttoday",
			textContent: "github",
			icon: "github",
		},
		// {
		// 	href: "https://gitlab.com/joblist",
		// 	textContent: "gitlab",
		// 	icon: "gitlab",
		// },
		{
			href: "https://matrix.to/#/#joblist.today:matrix.org",
			textContent: "chat",
			icon: "message-circle",
		},
		{
			href: "https://libli.org/#news.joblist.today:matrix.org",
			textContent: "news",
			icon: "newspaper",
		},
	],
];

export default class JoblistMenu extends HTMLElement {
	static get observedAttributes() {
		return ["open"];
	}
	/* props */
	get showDefault() {
		return this.getAttribute("show-default") === "true";
	}
	get showFavicon() {
		return this.getAttribute("show-favicon") === "true";
	}
	get href() {
		return this.getAttribute("href") || this.menus[0][0].href;
	}
	get open() {
		return this.getAttribute("open") === "true";
	}
	set open(bool) {
		this.setAttribute("open", bool);
	}
	get pin() {
		return this.getAttribute("pin") === "true";
	}
	set pin(bool) {
		this.setAttribute("pin", bool);
	}
	/* helpers */
	get id() {
		return "joblist-menu";
	}
	get menus() {
		return MENUS;
	}
	get minWidth() {
		return 1000;
	}
	get minWidthPredicate() {
		return window.innerWidth > this.minWidth;
	}
	/* events */
	onToggle() {
		this.open = !this.open;
		this.pin = true;
	}
	onResize() {
		if (!this.pin) {
			if (this.minWidthPredicate) {
				this.open = true;
			} else {
				this.open = false;
			}
		}
	}
	/* lifecycle */
	attributeChangedCallback() {
		this.render();
	}
	disconnectedCallback() {
		window.removeEventListener("resize", this.onResize);
	}
	connectedCallback() {
		/* first, save the initial markup */
		if (this.innerHTML) {
			const initialMenuTemplate = document.createElement("template");
			initialMenuTemplate.innerHTML = this.innerHTML;
			this.initialMenuTemplate = initialMenuTemplate;
		}

		window.addEventListener("resize", this.onResize.bind(this));

		if (this.minWidthPredicate) {
			this.open = true;
		}
		this.render();
	}

	render() {
		this.replaceChildren("");
		const doms = [];

		doms.push(this.createToggle());

		if (this.open) {
			if (this.initialMenuTemplate) {
				doms.push(this.initialMenuTemplate.content.cloneNode(true));
			}
			if (!this.hasChildNodes() || this.showDefault) {
				doms.push(...this.createMenus(this.menus));
			}
			if (this.showFavicon) {
				doms.push(this.createFavicon(this.href));
			}
		}

		this.append(...doms);
	}
	createToggle() {
		const button = document.createElement("button");
		button.setAttribute("title", "Menu");
		button.addEventListener("click", this.onToggle.bind(this));

		const iconElement = document.createElement("joblist-icon");
		iconElement.setAttribute("icon", "menu");
		iconElement.setAttribute("size", "medium");
		button.appendChild(iconElement);

		return button;
	}
	createFavicon(href) {
		const favicon = document.createElement("joblist-favicon");
		if (href) {
			favicon.setAttribute("href", href);
		}
		favicon.setAttribute("color", "var(--c-link)");
		return favicon;
	}
	createMenus(menus = []) {
		return menus.map(this.createMenuItems.bind(this));
	}
	createMenuItems(menu = []) {
		const $items = menu.map(this.createMenuItem.bind(this)).map(($link) => {
			const $li = document.createElement("li");
			$li.append($link);
			return $li;
		});
		const $menu = document.createElement("menu");
		$menu.append(...$items);
		return $menu;
	}
	createMenuItem({ href, textContent, icon } = {}) {
		const link = document.createElement("a");
		link.setAttribute("href", href);

		if (icon) {
			const iconElement = document.createElement("joblist-icon");
			iconElement.setAttribute("icon", icon);
			iconElement.setAttribute("size", "small");
			link.appendChild(iconElement);

			const textSpan = document.createElement("span");
			textSpan.textContent = textContent;
			link.appendChild(textSpan);
		} else {
			link.textContent = textContent;
		}

		return link;
	}
}
