const MENUS = [
	[
		{
			href: "https://joblist.gitlab.io/components/apps/search",
			textContent: "search",
		},
		{
			href: "https://joblist.gitlab.io/components/apps/map",
			textContent: "map",
		},
		{
			href: "https://joblist.gitlab.io/profiles/companies",
			textContent: "companies",
		},
		{ href: "https://joblist.gitlab.io/profiles/tags", textContent: "tags" },
	],
	[
		{ href: "https://edit.joblist.today", textContent: "edit" },
		{
			href: "https://edit.joblist.today/#/collections/companies/new",
			textContent: "new company",
		},
		{
			href: "https://edit.joblist.today/#/collections/tags/new",
			textContent: "new tag",
		},
	],
	[
		{ href: "https://api.joblist.today", textContent: "api" },
		{
			href: "https://joblist.gitlab.io/components/apps/boards",
			textContent: "providers",
		},
		{ href: "https://joblist.gitlab.io/dashboards", textContent: "dashboards" },
		{
			href: "https://sqlime.org/#https://joblist.gitlab.io/workers/joblist.db",
			textContent: "db.sqlite",
		},
	],
	[
		{ href: "https://github.com/joblisttoday", textContent: "github" },
		{ href: "https://gitlab.com/joblist", textContent: "gitlab" },
		{
			href: "https://matrix.to/#/#joblist.today:matrix.org",
			textContent: "matrix",
		},
		{
			href: "https://libli.org/#news.joblist.today:matrix.org",
			textContent: "news",
		},
	],
];

export default class JoblistMenu extends HTMLElement {
	/* props */
	get showDefault() {
		return this.getAttribute("show-default") === "true";
	}
	get showFavicon() {
		return this.getAttribute("show-favicon") === "true";
	}
	get href() {
		return this.getAttribute("href");
	}
	/* helpers */
	get id() {
		return "joblist-menu";
	}
	get menus() {
		return MENUS;
	}
	connectedCallback() {
		this.render();
	}
	render() {
		/* needs to be first in DOM for CSS input-checkbox toggle */
		this.prepend(this.createToggle(), this.createLabel());
		if (!this.hasChildNodes() || this.showDefault) {
			this.append(...this.createDefaultMenus(this.menus));
		}
		if (this.showFavicon) {
			this.append(this.createFavicon(this.href));
		}
	}
	createToggle() {
		const input = document.createElement("input");
		input.setAttribute("type", "checkbox");
		input.setAttribute("id", this.id);
		return input;
	}
	createLabel() {
		const label = document.createElement("label");
		label.setAttribute("for", this.id);
		return label;
	}
	createFavicon(href) {
		const favicon = document.createElement("joblist-favicon");
		if (href) {
			favicon.setAttribute("href", href);
		}
		return favicon;
	}
	createDefaultMenus(menus = []) {
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
