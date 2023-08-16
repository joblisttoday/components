class SearchResults extends HTMLElement {
	constructor() {
		super();
	}

	async connectedCallback() {
		this._render();
	}
	_render() {
		this.innerHTML = ''
		const $el = document.createElement('div')
		$el.innerText = "hello"
		this.append($el)
	}
}

if (!customElements.get('joblist-search-results')) {
	customElements.define('joblist-search-results', SearchResults);
}
