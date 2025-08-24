const SOCIAL_PROVIDERS = {
	wikipedia: {
		name: "Wikipedia",
		baseUrl: "https://en.wikipedia.org",
		embedUrl: null,
		extractId: (url) => {
			const match = url.match(/wikipedia\.org\/wiki\/(.+)$/);
			return match ? match[1] : null;
		},
		buildEmbedUrl: null,
	},
	linkedin: {
		name: "LinkedIn",
		baseUrl: "https://linkedin.com",
		embedUrl: null,
		extractId: (url) => {
			const match = url.match(/linkedin\.com\/company\/(.+?)(?:\/|$)/);
			return match ? match[1] : null;
		},
		buildEmbedUrl: null,
	},
	twitter: {
		name: "Twitter/X",
		baseUrl: "https://twitter.com",
		embedUrl: null,
		extractId: (url) => {
			const match = url.match(/(?:twitter\.com|x\.com)\/(.+?)(?:\/|$)/);
			return match ? match[1] : null;
		},
		buildEmbedUrl: null,
	},
	youtube: {
		name: "YouTube",
		baseUrl: "https://youtube.com",
		embedUrl: "https://www.youtube.com/embed",
		extractId: (url) => {
			const channelMatch = url.match(
				/youtube\.com\/(?:c\/|channel\/|user\/|@)(.+?)(?:\/|$)/,
			);
			return channelMatch ? channelMatch[1] : null;
		},
		buildEmbedUrl: (id) =>
			`https://www.youtube.com/embed/videoseries?list=UU${id}`,
	},
	facebook: {
		name: "Facebook",
		baseUrl: "https://facebook.com",
		embedUrl: "https://www.facebook.com/plugins/page.php",
		extractId: (url) => {
			const match = url.match(/facebook\.com\/(.+?)(?:\/|$)/);
			return match ? match[1] : null;
		},
		buildEmbedUrl: (id) =>
			`https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2F${id}&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`,
	},
	instagram: {
		name: "Instagram",
		baseUrl: "https://instagram.com",
		embedUrl: "https://www.instagram.com/embed.js",
		extractId: (url) => {
			const match = url.match(/instagram\.com\/(.+?)(?:\/|$)/);
			return match ? match[1] : null;
		},
		buildEmbedUrl: (id) => `https://www.instagram.com/${id}/embed/`,
	},
	atproto: {
		name: "Atproto",
		baseUrl: "https://bsky.app",
		embedUrl: null, // no official embeddable widget
		extractId: (url) => {
			if (!url) return null;
			// accept plain @handle or did:plc:... or a full bsky.app profile URL
			if (url.startsWith("@")) return url.slice(1);
		},
		buildEmbedUrl: null,
	},
};

export class JoblistSocialSDK {
	constructor() {
		this.providers = SOCIAL_PROVIDERS;
	}

	getProviderFromUrl(url) {
		if (!url) return null;

		// Special handling for Twitter/X domains
		if (url.includes("twitter.com") || url.includes("x.com")) {
			return { key: "twitter", ...this.providers.twitter };
		}

		for (const [key, provider] of Object.entries(this.providers)) {
			if (key === "twitter") continue; // Already handled above
			if (url.includes(provider.baseUrl.replace("https://", ""))) {
				return { key, ...provider };
			}
		}
		return null;
	}

	extractSocialId(url, providerKey) {
		const provider = this.providers[providerKey];
		if (!provider || !provider.extractId) return null;
		return provider.extractId(url);
	}

	canEmbed(providerKey) {
		const provider = this.providers[providerKey];
		return provider && provider.buildEmbedUrl !== null;
	}

	buildEmbedUrl(providerKey, id) {
		const provider = this.providers[providerKey];
		if (!provider || !provider.buildEmbedUrl) return null;
		return provider.buildEmbedUrl(id);
	}

	async fetchBasicInfo(url) {
		// Simple approach: try to fetch basic page info
		// In a real implementation, you might want to use specific APIs
		try {
			const response = await fetch(url, {
				mode: "no-cors",
				headers: { "User-Agent": "joblist-social-bot/1.0" },
			});

			// Since we can't access the response due to CORS,
			// return basic extracted info from URL
			const provider = this.getProviderFromUrl(url);
			if (provider) {
				const id = this.extractSocialId(url, provider.key);
				return {
					provider: provider.key,
					name: provider.name,
					id,
					url,
					canEmbed: this.canEmbed(provider.key),
					embedUrl: id ? this.buildEmbedUrl(provider.key, id) : null,
				};
			}
		} catch (error) {
			console.warn("Failed to fetch social info:", error);
		}

		return null;
	}
}

export default new JoblistSocialSDK();
