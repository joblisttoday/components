const JOBLIST_UMAMI_WEBSITE_ID = "479fa5c4-e9c9-4d8d-85c6-9a88c886dd24";

export default class JoblistUmamiScript extends HTMLElement {
	get websiteId() {
		return this.getAttribute("website-id") || JOBLIST_UMAMI_WEBSITE_ID;
	}
	get zone() {
		return this.getAttribute("zone") || "eu";
	}
	get src() {
		return `https://${this.zone}.umami.is/script.js`;
	}
	/* events */
	onScript(event) {
		console.info("Umami tracking disabled by user settings");
		this.setAttribute("disabled", true);
	}
	/* lifecycle */
	connectedCallback() {
		this.render();
	}
	render() {
		this.replaceChildren(
			this.buildScript({
				src: this.src,
				websiteId: this.websiteId,
			}),
		);
	}
	buildScript() {
		const $script = document.createElement("script");
		$script.setAttribute("async", true);
		$script.setAttribute("src", this.src);
		$script.setAttribute("data-website-id", this.websiteId);
		$script.addEventListener("error", this.onScript.bind(this));
		return $script;
	}
}
