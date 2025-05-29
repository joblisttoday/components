const MENUS = [
	[
		{
			href: "https://joblist.today",
			textContent: "home",
		},
		{
			href: "https://components.joblist.today/apps/search",
			textContent: "search",
		},
		{
			href: "https://components.joblist.today/apps/map",
			textContent: "map",
		},
		{
			href: "https://components.joblist.today/apps/companies",
			textContent: "companies",
		},
		{
			href: "https://components.joblist.today/apps/tags",
			textContent: "tags",
		},
		{
			href: "https://components.joblist.today/apps/boards",
			textContent: "providers",
		},
	],
	[
		{ href: "https://edit.joblist.today", textContent: "edit data" },
		{
			href: "https://edit.joblist.today/#/collections/companies/new",
			textContent: "new company",
		},
		/* {
			 href: "https://edit.joblist.today/#/collections/tags/new",
			 textContent: "new tag",
			 }, */
	],
	[
		{ href: "https://api.joblist.today", textContent: "api" },
		{ href: "https://dashboards.joblist.today/", textContent: "dashboards" },
		{
			href: "https://sqlime.org/#https://workers.joblist.today/joblist.db",
			textContent: "db.sqlite",
		},
	],
	[
		{ href: "https://github.com/joblisttoday", textContent: "github" },
		{ href: "https://gitlab.com/joblist", textContent: "gitlab" },
		{
			href: "https://matrix.to/#/#joblist.today:matrix.org",
			textContent: "chat",
		},
		{
			href: "https://libli.org/#news.joblist.today:matrix.org",
			textContent: "news",
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
		button.textContent = "≡";
		button.setAttribute("title", "Menu");
		button.addEventListener("click", this.onToggle.bind(this));
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
	createMenuItem({ href, textContent } = {}) {
		const link = document.createElement("a");
		link.setAttribute("href", href);
		link.textContent = textContent;
		return link;
	}
}
