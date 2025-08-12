import socialSDK from "../libs/sdk-social.js";

export default class JoblistSocialLink extends HTMLElement {
  get url() {
    return this.getAttribute("url");
  }
  
  get provider() {
    return this.getAttribute("provider");
  }
  
  get showEmbed() {
    return this.getAttribute("show-embed") === "true";
  }

  async connectedCallback() {
    if (this.url) {
      this.socialInfo = await socialSDK.fetchBasicInfo(this.url);
    }
    this.render();
  }

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