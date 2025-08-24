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
		// this.render();
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
			// Use oEmbed for Twitter/X posts and timelines
			this.tryOEmbedThenFallback(content, url, provider, () =>
				this.addTwitterContent(content, url, id),
			);
		} else if (provider === "instagram" && url) {
			// Instagram direct implementation works well, keep it
			this.addInstagramContent(content, url, id);
		} else if (provider === "facebook" && url) {
			// Facebook direct implementation works well, keep it
			this.addFacebookContent(content, url, id);
		} else if (provider === "linkedin" && url) {
			// LinkedIn has no public oEmbed API, use custom badge
			this.addLinkedInContent(content, url, id);
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
	 * Attempts to use oEmbed API first, then falls back to custom implementation.
	 *
	 * @param {HTMLElement} container - Container element to add content to
	 * @param {string} url - Full URL to embed
	 * @param {string} provider - Provider name
	 * @param {Function} fallbackFn - Fallback function to call if oEmbed fails
	 */
	async tryOEmbedThenFallback(container, url, provider, fallbackFn) {
		// Show loading state
		const loading = document.createElement("p");
		loading.className = "loading-text";
		loading.textContent = `Loading ${provider} content...`;
		container.appendChild(loading);

		try {
			const embedHtml = await this.fetchOEmbed(url, provider);
			if (embedHtml) {
				// Clear loading and add oEmbed content
				container.replaceChildren();
				const embedContainer = document.createElement("div");
				embedContainer.className = `${provider}-oembed-container`;
				embedContainer.innerHTML = embedHtml;
				container.appendChild(embedContainer);

				// Load any required scripts for the embed
				this.loadEmbedScripts(provider);
				return;
			}
		} catch (error) {
			console.warn(`oEmbed failed for ${provider}, using fallback:`, error);
		}

		// Clear loading and use fallback
		container.replaceChildren();
		if (fallbackFn) {
			fallbackFn();
		}
	}

	/**
	 * Fetches oEmbed data for a given URL and provider.
	 *
	 * @param {string} url - URL to fetch oEmbed for
	 * @param {string} provider - Provider name
	 * @returns {Promise<string|null>} HTML embed code or null if failed
	 */
	async fetchOEmbed(url, provider) {
		const oEmbedEndpoints = {
			twitter: "https://publish.twitter.com/oembed",
		};

		const endpoint = oEmbedEndpoints[provider];
		if (!endpoint) {
			return null;
		}

		const params = new URLSearchParams({
			url: url,
			format: "json",
			maxwidth: "300",
			maxheight: "400",
		});

		// Add provider-specific parameters
		if (provider === "twitter") {
			params.append("hide_media", "false");
			params.append("hide_thread", "false");
			params.append("omit_script", "true"); // We'll load the script ourselves
		}

		const response = await fetch(`${endpoint}?${params}`);
		if (!response.ok) {
			throw new Error(`oEmbed request failed: ${response.status}`);
		}

		const data = await response.json();
		return data.html || null;
	}

	/**
	 * Loads required scripts for embedded content.
	 *
	 * @param {string} provider - Provider name
	 */
	loadEmbedScripts(provider) {
		if (provider === "twitter") {
			this.loadXWidgetsScript(() => {
				console.log("X widgets loaded via oEmbed");
			});
		}
		// YouTube embeds don't need additional scripts
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
		// Show loading state
		const loading = document.createElement("p");
		loading.className = "loading-text";
		loading.textContent = "Loading Wikipedia preview...";
		container.appendChild(loading);

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
	 * Adds X (Twitter) timeline content to the social media preview.
	 * Uses the official X for Websites timeline embed API.
	 *
	 * @param {HTMLElement} container - Container element to add content to
	 * @param {string} url - Full X/Twitter profile URL
	 * @param {string} username - X/Twitter username
	 */
	addTwitterContent(container, url, username) {
		// Show loading state
		const loading = document.createElement("p");
		loading.className = "loading-text";
		loading.textContent = "Loading X timeline...";
		container.appendChild(loading);

		// Create X timeline embed container
		const embedContainer = document.createElement("div");
		embedContainer.className = "twitter-embed-container";

		// Create X timeline widget using official specification
		const timeline = document.createElement("a");
		timeline.className = "twitter-timeline";
		timeline.href = url;

		// Configure timeline appearance and behavior per X developer docs
		timeline.setAttribute("data-width", "300");
		timeline.setAttribute("data-height", "400");
		timeline.setAttribute("data-tweet-limit", "5");
		timeline.setAttribute(
			"data-chrome",
			"noheader nofooter noborders noscrollbar",
		);
		timeline.setAttribute("data-aria-polite", "polite");

		// Fallback text for accessibility and non-JS environments
		timeline.textContent = `Posts by @${username || "company"}`;

		// Add title for screen readers
		timeline.title = `X timeline for @${username || "company"}`;

		embedContainer.appendChild(timeline);
		container.appendChild(embedContainer);

		// Load X for Websites JavaScript (official widgets script)
		this.loadXWidgetsScript(() => {
			// Clear loading state once script loads
			const loadingText = container.querySelector(".loading-text");
			if (loadingText) {
				loadingText.remove();
			}
		});
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
		const loading = document.createElement("p");
		loading.className = "loading-text";
		loading.textContent = "Loading Instagram content...";
		container.appendChild(loading);

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

		// Handle iframe load success/failure
		iframe.onload = () => {
			// Clear loading text on successful load
			const loadingText = container.querySelector(".loading-text");
			if (loadingText) {
				loadingText.remove();
			}
		};

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

		const loading = document.createElement("p");
		loading.className = "loading-text";
		loading.textContent = "Trying alternative Instagram embed...";
		container.appendChild(loading);

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
		const loading = document.createElement("p");
		loading.className = "loading-text";
		loading.textContent = "Loading Facebook page...";
		container.appendChild(loading);

		// Try Facebook page plugin embed (no SDK required)
		this.tryFacebookPageEmbed(container, url, pageName);
	}

	/**
	 * Adds LinkedIn profile content to the social media preview.
	 * LinkedIn doesn't allow easy embedding, so shows simple description.
	 *
	 * @param {HTMLElement} container - Container element to add content to
	 * @param {string} url - Full LinkedIn profile URL
	 * @param {string} username - LinkedIn username
	 */
	addLinkedInContent(container, url, companyName) {
		// Create LinkedIn company badge
		const badgeContainer = document.createElement("div");
		badgeContainer.className = "linkedin-company-badge";

		// Badge header with company info
		const badgeHeader = document.createElement("div");
		badgeHeader.className = "linkedin-badge-header";

		// Company logo placeholder (LinkedIn blue circle with 'in')
		const logoContainer = document.createElement("div");
		logoContainer.className = "linkedin-logo-container";

		const logo = document.createElement("div");
		logo.className = "linkedin-logo";
		logo.textContent = "in";
		logoContainer.appendChild(logo);

		// Company information
		const companyInfo = document.createElement("div");
		companyInfo.className = "linkedin-company-info";

		const companyNameEl = document.createElement("div");
		companyNameEl.className = "linkedin-company-name";
		companyNameEl.textContent = companyName || "Company";

		const companyType = document.createElement("div");
		companyType.className = "linkedin-company-type";
		companyType.textContent = "Company Profile";

		companyInfo.appendChild(companyNameEl);
		companyInfo.appendChild(companyType);

		badgeHeader.appendChild(logoContainer);
		badgeHeader.appendChild(companyInfo);

		// Follow/View button
		const actionButton = document.createElement("a");
		actionButton.className = "linkedin-action-button";
		actionButton.href = url;
		actionButton.target = "_blank";
		actionButton.rel = "noopener noreferrer";
		actionButton.textContent = "View Profile";

		// LinkedIn branding footer
		const badgeFooter = document.createElement("div");
		badgeFooter.className = "linkedin-badge-footer";
		badgeFooter.textContent = "LinkedIn";

		// Assemble badge
		badgeContainer.appendChild(badgeHeader);
		badgeContainer.appendChild(actionButton);
		badgeContainer.appendChild(badgeFooter);

		container.appendChild(badgeContainer);

		// Add some CSS styling for the badge
		this.addLinkedInBadgeStyles();
	}

	/**
	 * Adds CSS styles for the LinkedIn company badge.
	 */
	addLinkedInBadgeStyles() {
		if (document.querySelector("#linkedin-badge-styles")) return;

		const style = document.createElement("style");
		style.id = "linkedin-badge-styles";
		style.textContent = `
			.linkedin-company-badge {
				border: 1px solid #e1e5e9;
				border-radius: 8px;
				background: #fff;
				padding: 16px;
				max-width: 300px;
				font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
				box-shadow: 0 2px 4px rgba(0,0,0,0.1);
			}

			.linkedin-badge-header {
				display: flex;
				align-items: center;
				gap: 12px;
				margin-bottom: 12px;
			}

			.linkedin-logo-container {
				flex-shrink: 0;
			}

			.linkedin-logo {
				width: 40px;
				height: 40px;
				background: #0a66c2;
				color: white;
				border-radius: 4px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-weight: bold;
				font-size: 14px;
			}

			.linkedin-company-info {
				flex: 1;
				min-width: 0;
			}

			.linkedin-company-name {
				font-size: 16px;
				font-weight: 600;
				color: #000;
				margin: 0;
				line-height: 1.3;
				word-wrap: break-word;
			}

			.linkedin-company-type {
				font-size: 14px;
				color: #666;
				margin: 2px 0 0 0;
			}

			.linkedin-action-button {
				display: inline-block;
				background: #0a66c2;
				color: white !important;
				padding: 8px 16px;
				border-radius: 24px;
				text-decoration: none;
				font-size: 14px;
				font-weight: 600;
				text-align: center;
				transition: background-color 0.2s;
				border: none;
				cursor: pointer;
			}

			.linkedin-action-button:hover {
				background: #004182;
			}

			.linkedin-badge-footer {
				margin-top: 12px;
				padding-top: 8px;
				border-top: 1px solid #e1e5e9;
				font-size: 12px;
				color: #666;
				text-align: center;
			}
		`;

		document.head.appendChild(style);
	}

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

		// Handle iframe load success/failure
		iframe.onload = () => {
			// Clear loading text on successful load
			const loadingText = container.querySelector(".loading-text");
			if (loadingText) {
				loadingText.remove();
			}
		};

		iframe.onerror = () => {
			// If iframe fails, show simple preview
			container.replaceChildren();
			this.createSimpleFacebookPreview(container, pageName || "Facebook Page");
		};

		// Timeout fallback - if iframe doesn't load within 5 seconds, show simple preview
		setTimeout(() => {
			const loadingText = container.querySelector(".loading-text");
			if (loadingText) {
				// Still loading after 5 seconds, show simple preview
				container.replaceChildren();
				this.createSimpleFacebookPreview(
					container,
					pageName || "Facebook Page",
				);
			}
		}, 5000);

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
