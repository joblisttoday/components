const JOBLIST_UMAMI_WEBSITE_ID = "479fa5c4-e9c9-4d8d-85c6-9a88c886dd24";

/**
 * Umami analytics script component for loading Umami tracking.
 * Dynamically loads the Umami analytics script with configurable website ID and zone.
 * Handles script loading errors and can be disabled via attributes.
 * 
 * @class JoblistUmamiScript
 * @extends HTMLElement
 */
export default class JoblistUmamiScript extends HTMLElement {
	/**
	 * Gets the Umami website ID for tracking.
	 * 
	 * @returns {string} Website ID from attribute or default Joblist ID
	 */
	get websiteId() {
		return this.getAttribute("website-id") || JOBLIST_UMAMI_WEBSITE_ID;
	}
	/**
	 * Gets the Umami server zone.
	 * 
	 * @returns {string} Server zone from attribute or default "eu"
	 */
	get zone() {
		return this.getAttribute("zone") || "eu";
	}
	/**
	 * Gets the full Umami script URL based on zone.
	 * 
	 * @returns {string} Complete URL to the Umami script
	 */
	get src() {
		return `https://${this.zone}.umami.is/script.js`;
	}
	/**
	 * Handles script loading errors.
	 * Logs a message and marks the component as disabled.
	 * 
	 * @param {Event} event - The error event from script loading
	 */
	onScript(event) {
		console.info("Umami tracking disabled by user settings");
		this.setAttribute("disabled", true);
	}
	/**
	 * Lifecycle callback when component is added to DOM.
	 * Triggers rendering of the Umami script element.
	 */
	connectedCallback() {
		this.render();
	}
	/**
	 * Renders the component by creating and appending the Umami script element.
	 */
	render() {
		this.replaceChildren(
			this.buildScript({
				src: this.src,
				websiteId: this.websiteId,
			}),
		);
	}
	/**
	 * Builds the Umami analytics script element.
	 * Creates a script element with proper attributes and error handling.
	 * 
	 * @returns {HTMLScriptElement} Configured script element for Umami tracking
	 */
	buildScript() {
		const $script = document.createElement("script");
		$script.setAttribute("async", true);
		$script.setAttribute("src", this.src);
		$script.setAttribute("data-website-id", this.websiteId);
		$script.addEventListener("error", this.onScript.bind(this));
		return $script;
	}
}
