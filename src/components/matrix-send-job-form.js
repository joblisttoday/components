/**
 * HTML template for job posting form
 * @const {HTMLTemplateElement}
 */
export const formTemplate = document.createElement("template");
formTemplate.innerHTML = `
	<form>
		<fieldset>
			<legend>URL (to an official job description, or application link)</legend>
			<input
						name="url"
						type="url"
						placeholder="https://example.org/jobs/job"
			/>
		</fieldset>
		<fieldset>
			<legend>Title (name of the job position)</legend>
			<input
						name="title"
						type="text"
						placeholder="Short descriptive text used as name for this job"
						required="true"
			/>
		</fieldset>
		<fieldset>
			<legend>Location (where in the world)</legend>
			<input
						name="location"
						type="text"
						placeholder="City, Country (Remote, Hybrid)"
						required="true"
			/>
		</fieldset>
		<fieldset>
			<legend>Description (more information about the tasks, missions, environment)</legend>
			<textarea
							 name="description"
							 placeholder="A text describing the job, all information any applicant needs to know in order to apply"
				></textarea>
		</fieldset>
		<fieldset>
			<button type="submit">Publish job</button>
		</fieldset>
	</form>
`;

/**
 * Supported OEmbed providers
 * @const {Object}
 */
export const PROVIDERS = {
	"www.youtube.com": "youtube",
	"youtube.com": "youtube",
	"youtu.be": "youtube",
	"soundcloud.com": "soundcloud",
	"vimeo.com": "vimeo",
};

/**
 * OEmbed API endpoints for each provider
 * @const {Object}
 */
const OEMBED_PROVIDERS = {
	soundcloud: "https://soundcloud.com/oembed?format=json&url=",
	youtube: "https://www.youtube.com/oembed?url=",
	vimeo: "https://vimeo.com/api/oembed.json?url=",
};

/**
 * Gets provider name from hostname
 * @param {string} hostname - Domain hostname
 * @returns {string} Provider name
 */
const getProvider = (hostname) => {
	return PROVIDERS[hostname];
};

/**
 * Builds OEmbed URL for provider and content URL
 * @param {string} provider - Provider name
 * @param {string} urlText - Content URL
 * @returns {string} Complete OEmbed API URL
 */
const getProviderOEmbedUrl = (provider, urlText) => {
	return `${OEMBED_PROVIDERS[provider]}${urlText}`;
};

/**
 * Gets OEmbed URL for any supported content URL
 * @param {string} urlText - Content URL to get embed data for
 * @returns {string|undefined} OEmbed API URL or undefined
 */
const getOEmbedUrl = (urlText) => {
	try {
		const url = new URL(urlText);
		const provider = getProvider(url.hostname);
		if (provider) {
			return getProviderOEmbedUrl(provider, urlText);
		}
	} catch (e) {
		// no data
	}
};

/**
 * Custom web component for Matrix job posting form with OEmbed support
 * @class MatrixSendJobForm
 * @extends HTMLElement
 */
export default class MatrixSendJobForm extends HTMLElement {
	/** @type {Object|null} OEmbed data from external services */
	oEmbedData = null;

	/**
	 * Fetches OEmbed data for media URLs
	 * @param {string} mediaProviderUrl - URL to fetch embed data for
	 * @returns {Promise<Object>} Promise resolving to OEmbed data
	 */
	fetchOEmbed(mediaProviderUrl) {
		const oEmbedUrl = getOEmbedUrl(mediaProviderUrl);
		if (oEmbedUrl) {
			return fetch(oEmbedUrl).then((res) => res.json());
		}
	}

	/**
	 * Gets the URL input element
	 * @returns {HTMLInputElement} URL input element
	 */
	get $formUrl() {
		return this.querySelector('input[name="url"]');
	}

	/**
	 * Gets the title input element
	 * @returns {HTMLInputElement} Title input element
	 */
	get $formTitle() {
		return this.querySelector('input[name="title"]');
	}

	/**
	 * Sets the form title if not already set
	 * @param {string} text - Title text to set
	 */
	setFormTitle(text) {
		if (this.$formTitle.value) {
			return;
		} else {
			this.$formTitle.value = text;
		}
	}
	/**
	 * Handles URL input changes and fetches OEmbed data
	 * @param {string} value - URL value
	 */
	async handleUrl(value) {
		if (value) {
			try {
				this.oEmbedData = await this.fetchOEmbed(value);
				if (this.oEmbedData?.title) {
					this.setFormTitle(this.oEmbedData.title);
				}
			} catch (error) {
				console.info("Error fetching oembed", error);
			}
		}
	}

	/**
	 * Handles input events on form fields
	 * @param {Event} event - Input event
	 */
	onUrlInput(event) {
		const { value, name } = event.target;
		if (name === "url") {
			this.handleUrl(value);
		} else {
			// no thing yet for other inputs
		}
	}
	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	connectedCallback() {
		this.render();
		this.$formUrl.addEventListener("input", this.onUrlInput.bind(this));
	}
	
	/**
	 * Renders the job posting form
	 */
	render() {
		const $form = formTemplate.content.cloneNode(true);
		this.replaceChildren($form);
	}
}
