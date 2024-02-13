import providerApis from "../providers/index.js";

export default class JobBoards extends HTMLElement {
	get providerIds() {
		return Object.keys(providerApis);
	}

	get providerName() {
		return this.getAttribute("provider-name");
	}
	set providerName(str) {
		this.setAttribute("provider-name", str);
	}
	get providerHostname() {
		/* default to the provider's name,
			 to see if they use their own system (most cases yes) */
		return this.getAttribute("provider-hostname") || this.providerName;
	}
	set providerHostname(str) {
		this.setAttribute("provider-hostname", str);
	}

	connectedCallback() {
		this.renderTemplate();
		this.renderForm();
	}
	renderTemplate() {
		this.innerHTML = `
			<form title="Build a job-list web-component"></form>
			<textarea readonly title="Copy this code snippet to insert the job listing in any HTML web-page"></textarea>
			<article title="Job listing"></article>
		`;
		this.$form = this.querySelector("form");
		this.$board = this.querySelector("article");
		this.$code = this.querySelector("textarea");
		this.$code.addEventListener("click", this.onSnippetClick.bind(this));
	}
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

		this.$form.append($providerSelect);
		this.$form.append($providerInput);
	}
	onChange({ target }) {
		const { name, value } = target;
		if (value) {
			this.setAttribute(name, value);
		} else {
			this.removeAttribute(name);
		}
		this.renderBoard();
	}
	onSnippetClick({ target }) {
		target.select();
	}
	renderBoard() {
		const $board = document.createElement("joblist-board");
		$board.setAttribute("provider-name", this.providerName);
		$board.setAttribute("provider-hostname", this.providerHostname);
		this.$board.innerHTML = "";
		this.renderBoardCopy($board);
		this.$board.append($board);
	}
	renderBoardCopy($board) {
		this.$code.innerText = `<joblist-board provider-name="${this.providerName}" provider-hostname="${this.providerHostname}"></joblist-board>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@joblist/job-board-providers/src/styles/index.css" />
<script async type="module" src="https://cdn.jsdelivr.net/npm/@joblist/job-board-providers/src/index.js"></script>`;
	}
}
