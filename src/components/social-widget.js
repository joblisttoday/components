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
      "instagram_url"
    ];

    const wrapper = document.createElement("div");
    wrapper.className = "social-widgets";

    // Create enhanced social links
    for (const linkKey of socialLinks) {
      const url = company[linkKey];
      if (url) {
        const socialInfo = await socialSDK.fetchBasicInfo(url);
        if (socialInfo) {
          const widget = this.createSocialWidget(socialInfo);
          if (widget) {
            wrapper.appendChild(widget);
          }
        }
      }
    }

    if (wrapper.children.length > 0) {
      const title = document.createElement("h3");
      title.textContent = "Social Media";
      this.appendChild(title);
      this.appendChild(wrapper);
    }
  }

  createSocialWidget(socialInfo) {
    const { provider, name, id, url, canEmbed } = socialInfo;
    
    const container = document.createElement("details");
    container.className = `social-widget social-${provider}`;
    
    const summary = document.createElement("summary");
    summary.textContent = name;
    container.appendChild(summary);
    
    const content = document.createElement("div");
    content.className = "social-content";
    
    // Basic info
    const info = document.createElement("div");
    info.className = "social-info";
    
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
    link.textContent = `Visit ${name} Profile`;
    info.appendChild(link);
    
    if (id) {
      const idSpan = document.createElement("span");
      idSpan.className = "social-id";
      idSpan.textContent = `ID: ${id}`;
      info.appendChild(idSpan);
    }
    
    content.appendChild(info);
    
    // Add provider-specific enhancements
    if (provider === "wikipedia" && id) {
      this.addWikipediaPreview(content, id);
    } else if (provider === "youtube" && id) {
      this.addYouTubePreview(content, id);
    } else if (canEmbed && socialInfo.embedUrl) {
      this.addSocialEmbed(content, socialInfo);
    }
    
    container.appendChild(content);
    return container;
  }

  addWikipediaPreview(container, pageTitle) {
    const preview = document.createElement("div");
    preview.className = "wikipedia-preview";
    
    // Simple Wikipedia API call for page summary
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
    
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
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
      .catch(error => {
        preview.textContent = "Failed to load Wikipedia preview";
        console.warn("Wikipedia API error:", error);
      });
    
    container.appendChild(preview);
  }

  addYouTubePreview(container, channelId) {
    const preview = document.createElement("div");
    preview.className = "youtube-preview";
    
    // Note: This would require YouTube API key in real implementation
    const placeholder = document.createElement("p");
    placeholder.textContent = "YouTube channel preview (API key required for full functionality)";
    preview.appendChild(placeholder);
    
    container.appendChild(preview);
  }

  addSocialEmbed(container, socialInfo) {
    const { provider, embedUrl } = socialInfo;
    
    const embed = document.createElement("iframe");
    embed.src = embedUrl;
    embed.frameBorder = "0";
    embed.allowTransparency = "true";
    
    // Provider-specific sizing
    switch (provider) {
      case "facebook":
        embed.width = "340";
        embed.height = "500";
        break;
      case "instagram":
        embed.width = "320";
        embed.height = "440";
        break;
      case "youtube":
        embed.width = "350";
        embed.height = "200";
        break;
      default:
        embed.width = "320";
        embed.height = "240";
    }
    
    container.appendChild(embed);
  }
}