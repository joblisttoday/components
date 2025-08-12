import { parseProviderUrl } from "../utils/provider-url-parser.js";
import providers from "../providers/index.js";

export default class JoblistBoard extends HTMLElement {
	get url() {
		return this.getAttribute("provider-url");
	}
	get hostname() {
		return this.getAttribute("provider-hostname");
	}
	get provider() {
		return this.getAttribute("provider-name");
	}

	constructor() {
		super();
		this.providerIds = Object.entries(providers).map(
			([_providerTag, provider]) => {
				return provider.id;
			},
		);
	}

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

	/* the provider's component, fetching jobs */
	renderProvider(provider, hostname) {
		const componentName = `joblist-board-${provider}`;
		const $providerComponent = document.createElement(componentName);
		$providerComponent.setAttribute("hostname", hostname);
		this.replaceChildren($providerComponent);
	}

	/* not a known provider */
	renderMissingProvider() {
		const $text = document.createElement("p");
		$text.textContent = "Job board provider or hostname unknown";
		this.replaceChildren($text);
	}
}
