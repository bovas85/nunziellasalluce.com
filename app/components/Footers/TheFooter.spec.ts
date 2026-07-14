import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import TheFooter from "./TheFooter.vue";

describe("TheFooter", () => {
  it("renders the footer element properly", async () => {
    const wrapper = await mountSuspended(TheFooter);
    expect(wrapper.find("footer.footer").exists()).toBe(true);
  });

  it("renders the privacy policy internal NuxtLink", async () => {
    const wrapper = await mountSuspended(TheFooter);
    const links = wrapper.findAll("a");
    const hasPrivacyPolicy = links.some(
      (link) => link.attributes("href") === "/privacy-policy",
    );

    // Assert that the privacy policy link is actually present
    expect(hasPrivacyPolicy).toBe(true);

    // Also check text
    expect(wrapper.text()).toContain("Privacy Policy");
  });

  it("verifies external links have target='_blank' and rel='noopener noreferrer'", async () => {
    const wrapper = await mountSuspended(TheFooter);
    const externalLinks = wrapper.findAll("a").filter(a => a.attributes("target") === "_blank");

    expect(externalLinks.length).toBeGreaterThan(0);
    externalLinks.forEach((link) => {
      expect(link.attributes("rel")).toBe("noopener noreferrer");
    });
  });

  it("links to correct social networks", async () => {
    const wrapper = await mountSuspended(TheFooter);
    const links = wrapper.findAll("a");

    const getHrefByClass = (className: string) => {
      const link = links.find(a => a.classes().includes(className));
      return link ? link.attributes("href") : undefined;
    };

    expect(getHrefByClass("social--dribbble")).toBe("https://dribbble.com/nunziella");
    expect(getHrefByClass("social--instagram")).toBe("https://www.instagram.com/lucettinas/");
    expect(getHrefByClass("social--behance")).toBe("https://www.behance.net/nunziellasalluce/");
    expect(getHrefByClass("social--linkedin")).toBe("https://www.linkedin.com/in/nunziella-salluce");
  });

  it("links to Moustache Design referral", async () => {
    const wrapper = await mountSuspended(TheFooter);
    const links = wrapper.findAll("a");
    const referrerLink = links.find(a => a.text().includes("Moustache Design"));

    expect(referrerLink).toBeDefined();
    expect(referrerLink?.attributes("href")).toBe("https://moustachedesign.xyz?referrer=nunziella-salluce-design");
  });
});
