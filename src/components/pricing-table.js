import "@stripe/stripe-js";

export default class JoblistPricingTable extends HTMLElement {
	get pricingTableId() {
		return this.getAttribute("pricing-table-id");
	}
	get publishableKey() {
		return this.getAttribute("publishable-key");
	}
	connectedCallback() {
		this.render();
	}
	render() {
		const stripe = document.createElement("stripe-pricing-table");
		stripe.setAttribute("pricing-table-id", this.pricingTableId);
		stripe.setAttribute("publishable-key", this.publishableKey);
		this.replaceChildren(stripe);
	}
}
