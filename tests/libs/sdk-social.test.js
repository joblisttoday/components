import { expect, test, vi, beforeEach } from "vitest";
import socialSDK from "../../src/libs/sdk-social.js";

beforeEach(() => {
  vi.clearAllMocks();
});

test("social SDK identifies Twitter/X URLs correctly", () => {
  const twitterUrl = "https://twitter.com/example";
  const xUrl = "https://x.com/example";
  
  const twitterProvider = socialSDK.getProviderFromUrl(twitterUrl);
  const xProvider = socialSDK.getProviderFromUrl(xUrl);
  
  expect(twitterProvider?.key).toBe("twitter");
  expect(xProvider?.key).toBe("twitter");
});

test("social SDK identifies LinkedIn URLs correctly", () => {
  const linkedinUrl = "https://linkedin.com/company/example";
  
  const provider = socialSDK.getProviderFromUrl(linkedinUrl);
  expect(provider?.key).toBe("linkedin");
});

test("social SDK identifies YouTube URLs correctly", () => {
  const youtubeUrl = "https://youtube.com/channel/example";
  
  const provider = socialSDK.getProviderFromUrl(youtubeUrl);
  expect(provider?.key).toBe("youtube");
});

test("social SDK identifies Instagram URLs correctly", () => {
  const instagramUrl = "https://instagram.com/example";
  
  const provider = socialSDK.getProviderFromUrl(instagramUrl);
  expect(provider?.key).toBe("instagram");
});

test("social SDK identifies Facebook URLs correctly", () => {
  const facebookUrl = "https://facebook.com/example";
  
  const provider = socialSDK.getProviderFromUrl(facebookUrl);
  expect(provider?.key).toBe("facebook");
});

test("social SDK identifies Wikipedia URLs correctly", () => {
  const wikipediaUrl = "https://en.wikipedia.org/wiki/Example";
  
  const provider = socialSDK.getProviderFromUrl(wikipediaUrl);
  expect(provider?.key).toBe("wikipedia");
});

test("social SDK returns null for unknown URLs", () => {
  const unknownUrl = "https://unknown-site.com/example";
  
  const provider = socialSDK.getProviderFromUrl(unknownUrl);
  expect(provider).toBe(null);
});

test("social SDK extracts Twitter username correctly", () => {
  const id = socialSDK.extractSocialId("https://twitter.com/example_user", "twitter");
  
  expect(id).toBe("example_user");
});

test("social SDK extracts LinkedIn company name correctly", () => {
  const id = socialSDK.extractSocialId("https://linkedin.com/company/example-company", "linkedin");
  
  expect(id).toBe("example-company");
});

test("social SDK extracts YouTube channel ID correctly", () => {
  const id = socialSDK.extractSocialId("https://youtube.com/channel/UCexample123", "youtube");
  
  expect(id).toBe("UCexample123");
});

test("social SDK extracts Instagram username correctly", () => {
  const id = socialSDK.extractSocialId("https://instagram.com/example_user", "instagram");
  
  expect(id).toBe("example_user");
});

test("social SDK extracts Wikipedia page title correctly", () => {
  const id = socialSDK.extractSocialId("https://en.wikipedia.org/wiki/Example_Page", "wikipedia");
  
  expect(id).toBe("Example_Page");
});

test("social SDK fetchBasicInfo returns complete info object", async () => {
  const url = "https://twitter.com/example";
  
  const info = await socialSDK.fetchBasicInfo(url);
  
  expect(info).toMatchObject({
    provider: "twitter",
    name: "Twitter/X",
    id: "example",
    url: url,
    canEmbed: expect.any(Boolean)
  });
});

test("social SDK handles invalid URLs gracefully", async () => {
  const invalidUrl = "not-a-url";
  
  const info = await socialSDK.fetchBasicInfo(invalidUrl);
  
  expect(info).toBe(null);
});

test("social SDK handles unsupported URLs gracefully", async () => {
  const unsupportedUrl = "https://unsupported-site.com/example";
  
  const info = await socialSDK.fetchBasicInfo(unsupportedUrl);
  
  expect(info).toBe(null);
});

test("social SDK determines embed capability correctly", () => {
  const twitterCanEmbed = socialSDK.canEmbed("twitter");
  const linkedinCanEmbed = socialSDK.canEmbed("linkedin");
  
  expect(twitterCanEmbed).toBe(false); // Twitter buildEmbedUrl is null in current implementation
  expect(linkedinCanEmbed).toBe(false); // LinkedIn doesn't support public embedding
});