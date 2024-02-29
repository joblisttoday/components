import { parseFrontmatter } from "../utils/markdown.js";

const KNOWN_HOSTS = ["cdn.jsdelivr.net", "github.com"];
const HOSTS = KNOWN_HOSTS.reduce((acc, host) => {
	acc[host] = host;
	return acc;
}, {});

export class JoblistGithubSDK {
	constructor({
		host = HOSTS["cdn.jsdelivr.net"],
		actor = "joblisttoday",
		repository = "data",
	} = {}) {
		this.host = host;
		this.actor = actor;
		this.repository = repository;
	}
	get url() {
		let hostUrl;
		if (this.host === HOSTS["cdn.jsdelivr.net"]) {
			return new URL(
				`https://${this.host}/gh/${this.actor}/${this.repository}`,
			);
		} else if (this.host === HOSTS["github.com"]) {
			return new URL(
				`https://${this.host}/${this.actor}${this.repository}/tree/main`,
			);
		}
	}
	buildCompanyUrl(slug) {
		return `${this.url}/companies/${slug}/index.md`;
	}
	async fetchCompany(slug) {
		const data = await fetch(this.buildCompanyUrl(slug)).then((res) => {
			return res.text();
		});
		return parseFrontmatter(data);
	}
}

export default new JoblistGithubSDK();
