import sdk from "../libs/sdk.js";

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
			<legend>Title</legend>
			<input
						name="title"
						placeholder="Short descriptive text used as name for this job"
						required="true"
			/>
		</fieldset>
		<fieldset>
			<legend>Description</legend>
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

export const PROVIDERS = {
	"www.youtube.com": "youtube",
	"youtube.com": "youtube",
	"youtu.be": "youtube",
	"soundcloud.com": "soundcloud",
	"vimeo.com": "vimeo",
};

const OEMBED_PROVIDERS = {
	soundcloud: "https://soundcloud.com/oembed?format=json&url=",
	youtube: "https://www.youtube.com/oembed?url=",
	vimeo: "https://vimeo.com/api/oembed.json?url=",
};

const getProvider = (hostname) => {
	return PROVIDERS[hostname];
};
const getProviderOEmbedUrl = (provider, urlText) => {
	return `${OEMBED_PROVIDERS[provider]}${urlText}`;
};

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

export default class MatrixSendJobForm extends HTMLElement {
	/* state */
	oEmbedData = null;

	/* methods */
	fetchOEmbed(mediaProviderUrl) {
		const oEmbedUrl = getOEmbedUrl(mediaProviderUrl);
		if (oEmbedUrl) {
			return fetch(oEmbedUrl).then((res) => res.json());
		}
	}

	/* dom helps */
	get $formUrl() {
		return this.querySelector('input[name="url"]');
	}

	get $formTitle() {
		return this.querySelector('input[name="title"]');
	}

	setFormTitle(text) {
		if (this.$formTitle.value) {
			return;
		} else {
			this.$formTitle.value = text;
		}
	}
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

	onUrlInput(event) {
		const { value, name } = event.target;
		if (name === "url") {
			this.handleUrl(value);
		} else {
			// no thing yet for other inputs
		}
	}
	connectedCallback() {
		this.render();
		this.$formUrl.addEventListener("input", this.onUrlInput.bind(this));
	}
	render() {
		const $form = formTemplate.content.cloneNode(true);
		this.replaceChildren($form);
	}
}
