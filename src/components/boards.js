import providerApis from "../providers/index.js";

/**
 * Custom web component for building job board components with form interface
 * @class JobBoards
 * @extends HTMLElement
 */
export default class JobBoards extends HTMLElement {
	/**
	 * Gets array of available provider IDs
	 * @returns {string[]} Array of provider IDs
	 */
	get providerIds() {
		return Object.keys(providerApis);
	}

	/**
	 * Gets mapping of providers to example hostnames
	 * @returns {Object} Object mapping provider names to example hostnames
	 */
	get providerExamples() {
		return {
			ashby: "ashby",
			greenhouse: "greenhouse",
			lever: "teleport",
			smartrecruiters: "smartrecruiters",
			personio: "gnosis",
			recruitee: "dataforce",
			workable: "workmotion",
			rippling: "rippling",
			matrix: "!room:matrix.org",
		};
	}

	/**
	 * Gets the provider name
	 * @returns {string} The provider name
	 */
	get providerName() {
		return this.getAttribute("provider-name");
	}
	
	/**
	 * Sets the provider name
	 * @param {string} str - The provider name to set
	 */
	set providerName(str) {
		this.setAttribute("provider-name", str);
	}
	
	/**
	 * Gets the provider hostname, defaults to provider name
	 * @returns {string} The provider hostname
	 */
	get providerHostname() {
		/* default to the provider's name,
			 to see if they use their own system (most cases yes) */
		return this.getAttribute("provider-hostname") || this.providerName;
	}
	
	/**
	 * Sets the provider hostname
	 * @param {string} str - The provider hostname to set
	 */
	set providerHostname(str) {
		this.setAttribute("provider-hostname", str);
	}

	/**
	 * Lifecycle method called when element is connected to DOM
	 */
	connectedCallback() {
		this.renderTemplate();
		this.renderForm();
	}
	
	/**
	 * Renders the HTML template structure
	 */
	renderTemplate() {
		// Create form
		const form = document.createElement("form");
		form.setAttribute("title", "Build a job-list web-component");
		
		// Create textarea
		const textarea = document.createElement("textarea");
		textarea.setAttribute("readonly", "");
		textarea.setAttribute("title", "Copy this code snippet to insert the job listing in any HTML web-page");
		
		// Create article
		const article = document.createElement("article");
		article.setAttribute("title", "Job listing");
		
		// Clear and assemble
		this.replaceChildren();
		this.appendChild(form);
		this.appendChild(textarea);
		this.appendChild(article);
		this.$form = this.querySelector("form");
		this.$board = this.querySelector("article");
		this.$code = this.querySelector("textarea");
		this.$code.addEventListener("click", this.onSnippetClick.bind(this));
	}
	/**
	 * Renders the form with provider selection and hostname input
	 */
	renderForm() {
		const $providerSelect = document.createElement("select");
		$providerSelect.name = "provider-name";
		$providerSelect.title =
			'Select a "provider-name" from the list of known providers';

		/*
			 Providers:
			 - the first one is the "not exitsting empty default"
			 - in between are all "supported providers"
		 */
		const allProvider = ["provider-name", ...this.providerIds];

		allProvider.forEach((providerId, index) => {
			const $providerOption = document.createElement("option");
			$providerOption.value = providerId;
			$providerOption.innerText = providerId;
			/* if it is the default provider */
			if (index === 0) {
				$providerOption.disabled = true;
				$providerOption.selected = true;
			}
			$providerSelect.append($providerOption);
		});
		$providerSelect.addEventListener("change", this.onChange.bind(this));

		const $providerInput = document.createElement("input");
		$providerInput.name = "provider-hostname";
		$providerInput.placeholder = "provider-hostname";
		$providerInput.title =
			'Enter a "provider-hostname", the identification name for this job board, when registered at the "provider"';
		$providerInput.addEventListener("input", this.onChange.bind(this));

		// Store reference to the hostname input for updating placeholder
		this.$hostnameInput = $providerInput;

		this.$form.append($providerSelect);
		this.$form.append($providerInput);
	}
	/**
	 * Handles form input changes
	 * @param {Object} param0 - Event object destructured
	 * @param {HTMLElement} param0.target - The target element that changed
	 */
	onChange({ target }) {
		const { name, value } = target;
		if (value) {
			this.setAttribute(name, value);
		} else {
			this.removeAttribute(name);
		}

		// Update hostname input placeholder when provider changes
		if (name === "provider-name" && this.$hostnameInput) {
			const example = this.providerExamples[value];
			if (example) {
				this.$hostnameInput.placeholder = `e.g. ${example}`;
				this.$hostnameInput.title = `Enter a "${value}" hostname, e.g. "${example}"`;
			} else {
				this.$hostnameInput.placeholder = "provider-hostname";
				this.$hostnameInput.title =
					'Enter a "provider-hostname", the identification name for this job board, when registered at the "provider"';
			}
		}

		this.renderBoard();
	}
	/**
	 * Handles click on code snippet to select all text
	 * @param {Object} param0 - Event object destructured
	 * @param {HTMLElement} param0.target - The target element that was clicked
	 */
	onSnippetClick({ target }) {
		target.select();
	}
	/**
	 * Renders the job board component with current settings
	 */
	renderBoard() {
		const $board = document.createElement("joblist-board");
		$board.setAttribute("provider-name", this.providerName);
		$board.setAttribute("provider-hostname", this.providerHostname);
		this.$board.replaceChildren();
		this.renderBoardCopy();
		this.$board.append($board);
	}
	/**
	 * Renders the copyable HTML code snippet
	 */
	renderBoardCopy() {
		this.$code.innerText = `
<joblist-board provider-name="${this.providerName}" provider-hostname="${this.providerHostname}"></joblist-board>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@joblist/components/src/styles/index.css" />
<script async type="module" src="https://cdn.jsdelivr.net/npm/@joblist/components"></script>
		`;
	}
}
