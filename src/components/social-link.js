import socialSDK from "../libs/sdk-social.js";

/**
 * Social media link component that renders enhanced social media links with optional embeds.
 * Fetches metadata from social platforms and can display embedded content when supported.
 * 
 * @class JoblistSocialLink
 * @extends HTMLElement
 */
export default class JoblistSocialLink extends HTMLElement {
  /**
   * Gets the social media URL to display.
   * 
   * @returns {string} The URL from the url attribute
   */
  get url() {
    return this.getAttribute("url");
  }
  
  /**
   * Gets the social media provider name.
   * 
   * @returns {string} The provider name from the provider attribute
   */
  get provider() {
    return this.getAttribute("provider");
  }
  
  /**
   * Gets whether to show embedded content.
   * 
   * @returns {boolean} True if show-embed attribute is "true"
   */
  get showEmbed() {
    return this.getAttribute("show-embed") === "true";
  }

  /**
   * Lifecycle callback when component is added to DOM.
   * Fetches social media metadata and renders the link.
   * 
   *
   */
  async connectedCallback() {
    if (this.url) {
      this.socialInfo = await socialSDK.fetchBasicInfo(this.url);
    }
    this.render();
  }

  /**
   * Renders the social link with optional embedded content.
   * Shows enhanced link with metadata or falls back to simple link.
   */
  render() {
    if (!this.socialInfo) {
      this.innerHTML = this.renderSimpleLink();
      return;
    }

    const { provider, name, id, url, canEmbed, embedUrl } = this.socialInfo;
    
    const wrapper = document.createElement("div");
    wrapper.className = `social-link social-${provider}`;
    
    // Always show the link
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
    link.textContent = name;
    link.title = `View on ${name}`;
    
    wrapper.appendChild(link);
    
    // Add embed if supported and requested
    if (this.showEmbed && canEmbed && embedUrl) {
      const embedContainer = document.createElement("div");
      embedContainer.className = "social-embed";
      
      if (provider === "facebook") {
        const iframe = document.createElement("iframe");
        iframe.src = embedUrl;
        iframe.width = "340";
        iframe.height = "200";
        iframe.style.border = "none";
        iframe.scrolling = "no";
        iframe.frameborder = "0";
        iframe.allowTransparency = "true";
        embedContainer.appendChild(iframe);
      } else if (provider === "twitter") {
        // For Twitter, we'd need to load their widget script
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        embedContainer.appendChild(script);
      }
      
      wrapper.appendChild(embedContainer);
    }
    
    this.innerHTML = "";
    this.appendChild(wrapper);
  }

  /**
   * Renders a simple link fallback when social info is not available.
   * 
   * @returns {string} HTML string for the simple link
   */
  renderSimpleLink() {
    if (!this.url) return "";
    
    const link = document.createElement("a");
    link.href = this.url;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
    link.textContent = this.provider || "Link";
    
    return link.outerHTML;
  }
}