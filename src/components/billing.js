export default class JoblistBilling extends HTMLElement {
	get url() {
		return this.getAttribute("url");
	}
	connectedCallback() {
		this.render();
	}
	render() {
		const stripe = document.createElement("a");
		stripe.setAttribute("href", this.url);
		stripe.textContent = "Manage billing account";
		this.replaceChildren(stripe);
	}
}
