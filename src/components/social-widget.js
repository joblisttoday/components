import socialSDK from "../libs/sdk-social.js";

export default class JoblistSocialWidget extends HTMLElement {
	get company() {
		return JSON.parse(this.getAttribute("company") || "{}");
	}

	connectedCallback() {
		this.render();
	}

	async render() {
		const company = this.company;
		const socialLinks = [
			"wikipedia_url",
			"linkedin_url",
			"twitter_url",
			"youtube_url",
			"facebook_url",
			"instagram_url",
		];

		// container
		const container = this;

		// single UL for all providers
		const list = document.createElement("ul");
		list.className = "social-widgets__list";
		list.setAttribute("role", "list");

		// fetch all social infos in parallel and build <li> items
		const items = await Promise.all(
			socialLinks.map(async (key) => {
				const url = company[key];
				if (!url) return null;
				try {
					const info = await socialSDK.fetchBasicInfo(url);
					if (!info) return null;
					return this.createSocialListItem(info);
				} catch (err) {
					console.warn("Failed to build social item for", url, err);
					return null;
				}
			}),
		);

		for (const li of items.filter(Boolean)) {
			list.appendChild(li);
		}

		// only render if we have at least one item
		container.appendChild(list);
		if (list.children.length > 0) {
			// replace existing content to avoid duplicates on re-render
			this.replaceChildren(container);
		}
	}

	// Builds a single <li> for a provider
	createSocialListItem(socialInfo) {
		const { provider } = socialInfo;
		const li = document.createElement("li");
		li.className = `social-widgets__item social--${provider}`;
		li.dataset.provider = provider;

		const content = this.buildSocialContent(socialInfo);
		if (!content) return null;

		li.appendChild(content);
		return li;
	}

	// Builds the inner content for a list item (embeds/previews)
	buildSocialContent(socialInfo) {
		const { provider, id, canEmbed } = socialInfo;

		// Provider-specific enhancements
		if (provider === "wikipedia" && id) {
			return this.addWikipediaPreview(id);
		}
		if (provider === "youtube" && id) {
			return this.addYouTubePreview(id);
		}
		if (canEmbed && socialInfo.embedUrl) {
			return this.addSocialEmbed(socialInfo);
		}
		return null;
	}

	addWikipediaPreview(pageTitle) {
		const preview = document.createElement("div");
		preview.className = "wikipedia-preview";

		const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
			pageTitle,
		)}`;

		fetch(apiUrl)
			.then((response) => response.json())
			.then((data) => {
				if (data.extract) {
					const excerpt = document.createElement("p");
					excerpt.textContent = data.extract;
					preview.appendChild(excerpt);

					if (data.thumbnail) {
						const img = document.createElement("img");
						img.src = data.thumbnail.source;
						img.alt = data.title;
						img.style.maxWidth = "200px";
						preview.appendChild(img);
					}
				}
			})
			.catch((error) => {
				preview.textContent = "Failed to load Wikipedia preview";
				console.warn("Wikipedia API error:", error);
			});

		return preview;
	}

	addYouTubePreview(channelId) {
		const preview = document.createElement("div");
		preview.className = "youtube-preview";

		// Note: This would require YouTube API key in real implementation
		const placeholder = document.createElement("p");
		placeholder.textContent =
			"YouTube channel preview (API key required for full functionality)";
		preview.appendChild(placeholder);

		return preview;
	}

	addSocialEmbed(socialInfo) {
		const { provider, embedUrl } = socialInfo;

		const iframe = document.createElement("iframe");
		iframe.src = embedUrl;
		iframe.frameBorder = "0";
		iframe.allowTransparency = "true";
		iframe.setAttribute("title", `${provider} embed`);
		return iframe;
	}
}
