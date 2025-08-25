/**
 * Social links preview widget for companies.
 * Fetches basic info for known providers and renders a harmonized list.
 * @class JoblistSocialWidget
 * @extends HTMLElement
 */
import socialSDK from "../libs/sdk-social.js";
import "./icon.js";

export default class JoblistSocialWidget extends HTMLElement {
	/** @returns {Record<string, string>} Parsed company object from attribute */
	get company() {
		return JSON.parse(this.getAttribute("company") || "{}");
	}

	/** Lifecycle: render on connect */
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
			"atproto_url",
		];

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
		if (list.children.length > 0) {
			// replace existing content to avoid duplicates on re-render
			this.replaceChildren(list);
		}
	}

	/**
	 * Builds a single list item for a social media provider.
	 *
	 * @param {Object} socialInfo - Social media information object
	 * @param {string} socialInfo.provider - The social media provider name
	 * @returns {HTMLLIElement|null} List item element or null if content creation fails
	 */
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

	/**
	 * Builds the inner content for a social media list item with embeds when possible.
	 * Creates a harmonized preview with provider-specific embedded content.
	 *
	 * @param {Object} socialInfo - Social media information object
	 * @param {string} socialInfo.provider - The social media provider
	 * @param {string} socialInfo.id - Provider-specific identifier
	 * @param {string} socialInfo.url - Full URL to the social media profile
	 * @param {string} socialInfo.name - Display name for the profile
	 * @returns {HTMLDivElement|null} Content container element or null if creation fails
	 */
	buildSocialContent(socialInfo) {
		const { provider, id, url, name } = socialInfo;

		// Create harmonized social preview with consistent @profile pattern
		const preview = document.createElement("div");
		preview.className = `social-preview ${provider}-preview`;

		// Create consistent header for all providers
		const header = this.createSocialHeader(provider, id, url, name);
		preview.appendChild(header);

		// Add provider-specific embed content
		const content = document.createElement("div");
		content.className = "social-preview-content";

		// Use oEmbed for Twitter/X, keep existing implementations for others
		if (provider === "wikipedia" && id) {
			this.addWikipediaContent(content, id, url);
		} else if (provider === "youtube" && id) {
			// YouTube direct implementation works well, keep it
			this.addYouTubeContent(content, id, url);
		} else if (provider === "twitter" && url) {
			// Twitter/X: simple link since embeds often fail
		} else if (provider === "instagram" && url) {
			// Instagram direct implementation works well, keep it
			this.addInstagramContent(content, url, id);
		} else if (provider === "facebook" && url) {
			// Facebook direct implementation works well, keep it
			this.addFacebookContent(content, url, id);
		} else if (provider === "linkedin" && url) {
			// LinkedIn: simple link since no embeds allowed
		}

		preview.appendChild(content);

		return preview;
	}

	/**
	 * Creates a consistent header for social media previews.
	 *
	 * @param {string} provider - The social media provider name
	 * @param {string} id - Provider-specific identifier
	 * @param {string} url - Full URL to the social media profile
	 * @param {string} name - Display name for the profile
	 * @returns {HTMLDivElement} Header element with icon and profile information
	 */
	createSocialHeader(provider, id, url, name) {
		const header = document.createElement("div");
		header.className = "social-preview-header";

		const icon = document.createElement("joblist-icon");
		icon.setAttribute("icon", provider);
		icon.setAttribute("size", "medium");
		icon.setAttribute("class", `social-icon ${provider}-icon`);

		// Consistent profile information and link
		const profileInfo = document.createElement("div");
		profileInfo.className = "social-info";

		let profileHandle, platformName;
		switch (provider) {
			case "wikipedia":
				profileHandle = id || "Wikipedia";
				platformName = "Wikipedia Article";
				break;
			case "youtube":
				profileHandle = `@${id || name}`;
				platformName = "YouTube";
				break;
			case "linkedin":
				profileHandle = `@${id || name}`;
				platformName = "LinkedIn";
				break;
			case "twitter":
				profileHandle = `@${id || name}`;
				platformName = "Twitter/X";
				break;
			case "facebook":
				profileHandle = `@${id || name}`;
				platformName = "Facebook";
				break;
			case "instagram":
				profileHandle = `@${id || name}`;
				platformName = "Instagram";
				break;
			default:
				profileHandle = `@${id || name}`;
				platformName = provider.charAt(0).toUpperCase() + provider.slice(1);
		}

		// Create clickable profile link
		const profileLink = document.createElement("a");
		profileLink.href = url;
		profileLink.target = "_blank";
		profileLink.rel = "noopener noreferrer";
		profileLink.className = "profile-link";

		const profileName = document.createElement("strong");
		profileName.className = "profile-name";
		profileName.textContent = profileHandle;

		const platformLabel = document.createElement("span");
		platformLabel.className = "platform-label";
		platformLabel.textContent = platformName;

		profileLink.appendChild(profileName);
		profileLink.appendChild(platformLabel);
		profileInfo.appendChild(profileLink);
		header.appendChild(icon);
		header.appendChild(profileInfo);

		return header;
	}

	/**
	 * Adds Wikipedia content to the social media preview.
	 * Fetches Wikipedia page summary and thumbnail using the REST API.
	 *
	 * @param {HTMLElement} container - Container element to add content to
	 * @param {string} pageTitle - Wikipedia page title
	 * @param {string} url - Full Wikipedia URL
	 */
	addWikipediaContent(container, pageTitle, url) {
		// Use Wikipedia REST API (no auth required)
		const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;

		fetch(apiUrl)
			.then((response) => response.json())
			.then((data) => {
				container.replaceChildren();

				if (data.extract) {
					const contentWrapper = document.createElement("div");
					contentWrapper.className = "wikipedia-content";

					// Add thumbnail if available
					if (data.thumbnail) {
						const imgContainer = document.createElement("div");
						imgContainer.className = "wikipedia-image";

						const img = document.createElement("img");
						img.className = "wikipedia-thumbnail";
						img.src = data.thumbnail.source;
						img.alt = data.title;

						imgContainer.appendChild(img);
						contentWrapper.appendChild(imgContainer);
					}

					// Add extract
					const textContent = document.createElement("div");
					textContent.className = "wikipedia-text";

					const extract = document.createElement("p");
					extract.className = "wikipedia-extract";
					extract.textContent = data.extract;

					textContent.appendChild(extract);
					contentWrapper.appendChild(textContent);
					container.appendChild(contentWrapper);
				} else {
					const noInfo = document.createElement("p");
					noInfo.className = "no-info-text";
					noInfo.textContent = "Wikipedia information not available";
					container.appendChild(noInfo);
				}
			})
			.catch((error) => {
				container.replaceChildren();
				const errorMsg = document.createElement("p");
				errorMsg.className = "error-text";
				errorMsg.textContent = "Failed to load Wikipedia preview";
				container.appendChild(errorMsg);
			});
	}

	/**
	 * Adds YouTube channel content to the social media preview.
	 * Embeds YouTube channel content or shows description fallback.
	 *
	 * @param {HTMLElement} container - Container element to add content to
	 * @param {string} channelId - YouTube channel identifier
	 * @param {string} url - Full YouTube channel URL
	 */
	addYouTubeContent(container, channelId, url) {
		// Add YouTube embed iframe (no API key required for embedding)
		if (
			url.includes("/channel/") ||
			url.includes("/c/") ||
			url.includes("/@")
		) {
			const embedContainer = document.createElement("div");
			embedContainer.className = "youtube-embed-container";

			const iframe = document.createElement("iframe");
			iframe.className = "youtube-iframe";

			// Convert channel URL to embed URL
			let embedUrl = url;
			if (url.includes("/channel/")) {
				const channelId = url.split("/channel/")[1].split("/")[0];
				embedUrl = `https://www.youtube.com/embed?listType=user_uploads&list=${channelId}`;
			} else if (url.includes("/@")) {
				const username = url.split("/@")[1].split("/")[0];
				embedUrl = `https://www.youtube.com/embed?listType=user_uploads&list=${username}`;
			}

			iframe.src = embedUrl;
			iframe.allowfullscreen = true;
			iframe.loading = "lazy";
			iframe.title = `YouTube channel: ${channelId}`;

			embedContainer.appendChild(iframe);
			container.appendChild(embedContainer);
		} else {
			// Simple description if can't embed
			const description = document.createElement("p");
			description.className = "platform-description";
			description.textContent =
				"YouTube channel with videos and content from this company.";
			container.appendChild(description);
		}
	}

	/**
	 * Loads the X for Websites JavaScript library for timeline rendering.
	 * Only loads the script once per page to avoid duplicates.
	 *
	 * @param {Function} callback - Callback function to execute when script loads
	 */
	loadXWidgetsScript(callback) {
		const scriptSrc = "https://platform.twitter.com/widgets.js";

		// Check if script already exists
		if (document.querySelector(`script[src="${scriptSrc}"]`)) {
			// Script already loaded, just trigger widget load
			if (window.twttr && window.twttr.widgets) {
				window.twttr.widgets.load().then(callback);
			} else if (callback) {
				callback();
			}
			return;
		}

		// Load script for the first time
		const script = document.createElement("script");
		script.src = scriptSrc;
		script.async = true;
		script.charset = "utf-8";

		script.onload = () => {
			// Wait for twttr object to be available
			if (window.twttr && window.twttr.widgets) {
				window.twttr.widgets.load().then(callback);
			} else {
				// Fallback if twttr not immediately available
				setTimeout(() => {
					if (window.twttr && window.twttr.widgets) {
						window.twttr.widgets.load().then(callback);
					} else if (callback) {
						callback();
					}
				}, 100);
			}
		};

		script.onerror = () => {
			console.warn("Failed to load X widgets script");
			if (callback) callback();
		};

		document.head.appendChild(script);
	}

	/**
	 * Adds Instagram profile content to the social media preview.
	 * Attempts to embed Instagram profile directly.
	 *
	 * @param {HTMLElement} container - Container element to add content to
	 * @param {string} url - Full Instagram profile URL
	 * @param {string} username - Instagram username
	 */
	addInstagramContent(container, url, username) {
		// First, try to embed Instagram profile directly via iframe
		this.tryInstagramProfileEmbed(container, url, username);
	}

	/**
	 * Attempts to embed an Instagram profile using iframe.
	 *
	 * @param {HTMLElement} container - Container element to add content to
	 * @param {string} url - Full Instagram profile URL
	 * @param {string} username - Instagram username
	 */
	tryInstagramProfileEmbed(container, url, username) {
		// Try direct profile iframe embed first (works for many public profiles)
		const embedUrl = url.substr(-1) === "/" ? `${url}embed/` : `${url}/embed/`;

		const iframeContainer = document.createElement("div");
		iframeContainer.className = "instagram-embed-container";

		const iframe = document.createElement("iframe");
		iframe.className = "instagram-iframe";
		iframe.src = embedUrl;
		iframe.loading = "lazy";
		iframe.title = `Instagram profile: ${username}`;

		iframeContainer.appendChild(iframe);
		container.appendChild(iframeContainer);
	}

	/**
	 * Attempts to use Instagram oEmbed API as fallback.
	 *
	 * @param {HTMLElement} container - Container element to add content to
	 * @param {string} url - Full Instagram profile URL
	 * @param {string} username - Instagram username
	 */
	tryInstagramOEmbed(container, url, username) {
		// Clear existing content
		container.replaceChildren();

		// Try Instagram oEmbed API (public, no auth required)
		const oEmbedUrl = `https://graph.instagram.com/oembed?url=${encodeURIComponent(url)}`;

		fetch(oEmbedUrl)
			.then((response) => response.json())
			.then((data) => {
				container.replaceChildren();
				if (data.html) {
					// Create container for Instagram oEmbed (unfortunately need innerHTML here for oEmbed HTML)
					const embedContainer = document.createElement("div");
					embedContainer.className = "instagram-oembed-container";
					embedContainer.innerHTML = data.html;
					container.appendChild(embedContainer);

					// Load Instagram embed script (minimal, one-time load)
					if (
						!window.instgrm &&
						!document.querySelector('script[src*="instagram.com/embed"]')
					) {
						const script = document.createElement("script");
						script.src = "https://www.instagram.com/embed.js";
						script.async = true;
						script.onload = () => {
							if (window.instgrm && window.instgrm.Embeds) {
								window.instgrm.Embeds.process();
							}
						};
						document.head.appendChild(script);
					} else if (window.instgrm && window.instgrm.Embeds) {
						// Process embeds if script already loaded
						window.instgrm.Embeds.process();
					}
				} else {
					// Final fallback to simple preview
					this.createSimpleInstagramPreview(container, username);
				}
			})
			.catch((error) => {
				// Final fallback to simple preview on error
				container.replaceChildren();
				this.createSimpleInstagramPreview(container, username);
			});
	}

	/**
	 * Creates a simple Instagram preview as final fallback.
	 *
	 * @param {HTMLElement} container - Container element to add content to
	 * @param {string} username - Instagram username
	 */
	createSimpleInstagramPreview(container, username) {
		const simplePreview = document.createElement("div");
		simplePreview.className = "instagram-simple-preview";

		// Instagram-style avatar placeholder
		const avatar = document.createElement("div");
		avatar.className = "instagram-avatar";

		const textContent = document.createElement("div");
		textContent.className = "instagram-info";

		const profileName = document.createElement("strong");
		profileName.className = "instagram-username";
		profileName.textContent = `@${username}`;

		const description = document.createElement("p");
		description.className = "instagram-description";
		description.textContent = "Instagram profile content";

		textContent.appendChild(profileName);
		textContent.appendChild(description);
		simplePreview.appendChild(avatar);
		simplePreview.appendChild(textContent);
		container.appendChild(simplePreview);
	}

	/**
	 * Adds Facebook page content to the social media preview.
	 * Attempts to embed Facebook page using the page plugin.
	 *
	 * @param {HTMLElement} container - Container element to add content to
	 * @param {string} url - Full Facebook page URL
	 * @param {string} pageName - Facebook page name
	 */
	addFacebookContent(container, url, pageName) {
		// Try Facebook page plugin embed (no SDK required)
		this.tryFacebookPageEmbed(container, url, pageName);
	}

	/**
	/**
	 * Attempts to embed a Facebook page using the page plugin iframe.
	 * Includes timeout fallback to simple preview if embedding fails.
	 *
	 * @param {HTMLElement} container - Container element to add content to
	 * @param {string} url - Full Facebook page URL
	 * @param {string} pageName - Facebook page name
	 */
	tryFacebookPageEmbed(container, url, pageName) {
		// Use Facebook's page plugin embed URL (no SDK dependencies)
		const encodedUrl = encodeURIComponent(url);
		const embedUrl = `https://www.facebook.com/plugins/page.php?href=${encodedUrl}&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`;

		const iframeContainer = document.createElement("div");
		iframeContainer.className = "facebook-embed-container";

		const iframe = document.createElement("iframe");
		iframe.className = "facebook-iframe";
		iframe.src = embedUrl;
		iframe.loading = "lazy";
		iframe.title = `Facebook page: ${pageName}`;
		iframe.allow = "encrypted-media";

		iframe.onerror = () => {
			// If iframe fails, show simple preview
			container.replaceChildren();
			this.createSimpleFacebookPreview(container, pageName || "Facebook Page");
		};
		iframeContainer.appendChild(iframe);
		container.appendChild(iframeContainer);
	}

	/**
	 * Creates a simple Facebook preview as fallback.
	 *
	 * @param {HTMLElement} container - Container element to add content to
	 * @param {string} pageName - Facebook page name
	 */
	createSimpleFacebookPreview(container, pageName) {
		const simplePreview = document.createElement("div");
		simplePreview.className = "facebook-simple-preview";

		// Facebook-style avatar placeholder
		const avatar = document.createElement("div");
		avatar.className = "facebook-avatar";
		avatar.textContent = "f";

		const textContent = document.createElement("div");
		textContent.className = "facebook-info";

		const profileName = document.createElement("strong");
		profileName.className = "facebook-pagename";
		profileName.textContent = pageName;

		const description = document.createElement("p");
		description.className = "facebook-description";
		description.textContent = "Facebook company page";

		textContent.appendChild(profileName);
		textContent.appendChild(description);
		simplePreview.appendChild(avatar);
		simplePreview.appendChild(textContent);
		container.appendChild(simplePreview);
	}
}
