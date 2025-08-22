import { parseProviderUrl } from "../utils/provider-url-parser.js";
import providers from "../providers/index.js";

/**
 * Custom web component for displaying job boards from various providers
 * @class JoblistBoard
 * @extends HTMLElement
 */
export default class JoblistBoard extends HTMLElement {
	/**
	 * Gets the provider URL
	 * @returns {string} The provider URL
	 */
	get url() {
		return this.getAttribute("provider-url");
	}
	
	/**
	 * Gets the provider hostname
	 * @returns {string} The provider hostname
	 */
	get hostname() {
		return this.getAttribute("provider-hostname");
	}
	
	/**
	 * Gets the provider name
	 * @returns {string} The provider name
	 */
	get provider() {
		return this.getAttribute("provider-name");
	}

	/**
	 * Constructor to initialize provider IDs
	 */
	constructor() {
		super();
		this.providerIds = Object.entries(providers).map(
			([_providerTag, provider]) => {
				return provider.id;
			},
		);
	}

	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	connectedCallback() {
		if (!this.provider && !this.hostname && this.url) {
			const result = parseProviderUrl(this.url);
			this.provider = result.provider;
			this.hostname = result.id;
		}

		if (this.provider && this.hostname) {
			if (this.providerIds.indexOf(this.provider) === -1) {
				this.renderMissingProvider();
			} else {
				this.renderProvider(this.provider, this.hostname);
			}
		} else {
			this.renderMissingProvider();
		}
	}

	/**
	 * Renders the provider component for fetching jobs
	 * @param {string} provider - Provider name
	 * @param {string} hostname - Provider hostname
	 */
	renderProvider(provider, hostname) {
		const componentName = `joblist-board-${provider}`;
		const $providerComponent = document.createElement(componentName);
		$providerComponent.setAttribute("hostname", hostname);
		this.replaceChildren($providerComponent);
	}

	/**
	 * Renders error message for unknown providers
	 */
	renderMissingProvider() {
		const $text = document.createElement("p");
		$text.textContent = "Job board provider or hostname unknown";
		this.replaceChildren($text);
	}
}
