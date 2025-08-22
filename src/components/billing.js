/**
 * Custom web component for displaying a billing management link
 * @class JoblistBilling
 * @extends HTMLElement
 */
export default class JoblistBilling extends HTMLElement {
	/**
	 * Gets the URL for the billing management link
	 * @returns {string} The billing URL
	 */
	get url() {
		return this.getAttribute("url");
	}
	
	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	connectedCallback() {
		this.render();
	}
	
	/**
	 * Renders the billing management link
	 */
	render() {
		const stripe = document.createElement("a");
		stripe.setAttribute("href", this.url);
		stripe.textContent = "Manage billing account";
		this.replaceChildren(stripe);
	}
}
