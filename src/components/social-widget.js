import socialSDK from "../libs/sdk-social.js";
import "./icon.js";

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

	// Builds the inner content for a list item (with embeds when possible)
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

		if (provider === "wikipedia" && id) {
			this.addWikipediaContent(content, id, url);
		} else if (provider === "youtube" && id) {
			// this.addYouTubeContent(content, id, url);
		} else if (provider === "twitter" && url) {
			// this.addTwitterContent(content, url, id);
		} else if (provider === "instagram" && url) {
			this.addInstagramContent(content, url, id);
		} else if (provider === "facebook" && url) {
			this.addFacebookContent(content, url, id);
		} else if (provider === "linkedin" && url) {
			// this.addLinkedInContent(content, url, id);
		} else if ((provider === "atproto" && url) || true) {
			console.log("at proto", content);
			// this.addLinkedInContent(content, url, id);
		}

		preview.appendChild(content);

		return preview;
	}

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

	addTwitterContent(container, url, username) {
		// Add Twitter timeline embed (public, no API key required)
		const embedContainer = document.createElement("div");
		embedContainer.className = "twitter-embed-container";

		// Create Twitter timeline widget
		const timeline = document.createElement("a");
		timeline.className = "twitter-timeline";
		timeline.href = url;
		timeline.setAttribute("data-height", "400");
		timeline.setAttribute("data-theme", "light");
		timeline.setAttribute("data-chrome", "noheader nofooter noborders");
		timeline.textContent = `Tweets by @${username}`;

		embedContainer.appendChild(timeline);
		container.appendChild(embedContainer);

		// Load Twitter widgets script (only once)
		const instagramSrc = "https://platform.twitter.com/widgets.js";
		if (
			!window.twttr &&
			!document.querySelector(`script[src*="${instagramSrc}"]`)
		) {
			const script = document.createElement("script");
			script.src = instagramSrc;
			script.async = true;
			script.onload = () => {
				if (window.twttr && window.twttr.widgets) {
					window.twttr.widgets.load();
				}
			};
			document.head.appendChild(script);
		} else if (window.twttr && window.twttr.widgets) {
			// Reload widgets if script already exists
			window.twttr.widgets.load();
		}
	}

	addInstagramContent(container, url, username) {
		const loading = document.createElement("p");
		loading.className = "loading-text";
		loading.textContent = "Loading Instagram content...";
		container.appendChild(loading);

		// First, try to embed Instagram profile directly via iframe
		this.tryInstagramProfileEmbed(container, url, username);
	}

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

	addFacebookContent(container, url, pageName) {
		const loading = document.createElement("p");
		loading.className = "loading-text";
		loading.textContent = "Loading Facebook page...";
		container.appendChild(loading);

		// Try Facebook page plugin embed (no SDK required)
		this.tryFacebookPageEmbed(container, url, pageName);
	}

	addLinkedInContent(container, url, username) {
		// LinkedIn doesn't allow easy embedding, so show simple description
		const description = document.createElement("p");
		description.className = "platform-description";
		description.textContent = `See LinkedIn profile @${username}`;
		container.appendChild(description);
	}

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
