import "@stripe/stripe-js";

/**
 * Custom web component for displaying Stripe pricing tables
 * @class JoblistPricingTable
 * @extends HTMLElement
 */
export default class JoblistPricingTable extends HTMLElement {
	/**
	 * Gets the Stripe pricing table ID
	 * @returns {string} Pricing table ID
	 */
	get pricingTableId() {
		return this.getAttribute("pricing-table-id");
	}
	
	/**
	 * Gets the Stripe publishable key
	 * @returns {string} Publishable key
	 */
	get publishableKey() {
		return this.getAttribute("publishable-key");
	}
	
	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	connectedCallback() {
		this.render();
	}
	
	/**
	 * Renders the Stripe pricing table
	 */
	render() {
		const stripe = document.createElement("stripe-pricing-table");
		stripe.setAttribute("pricing-table-id", this.pricingTableId);
		stripe.setAttribute("publishable-key", this.publishableKey);
		this.replaceChildren(stripe);
	}
}
