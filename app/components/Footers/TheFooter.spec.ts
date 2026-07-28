import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import IconsTheLogoStatic from "../Icons/TheLogoStatic.vue";
import FootersBadge from "./Badge.vue";
import TheFooter from "./TheFooter.vue";

describe("TheFooter", () => {
  it("renders the footer correctly", async () => {
    const wrapper = await mountSuspended(TheFooter);

    expect(wrapper.find("footer.footer").exists()).toBe(true);
    expect(wrapper.find(".left-section").exists()).toBe(true);
    expect(wrapper.find(".right-section").exists()).toBe(true);
    expect(wrapper.find(".social-and-logos").exists()).toBe(true);
  });

  it("renders the logo and child components", async () => {
    const wrapper = await mountSuspended(TheFooter);

    expect(wrapper.findComponent(IconsTheLogoStatic).exists()).toBe(true);
    expect(wrapper.findComponent(FootersBadge).exists()).toBe(true);
  });

  it("renders correct navigation and referral links", async () => {
    const wrapper = await mountSuspended(TheFooter);

    // Check if privacy policy link is present in the rendered HTML since it's a NuxtLink
    expect(wrapper.html()).toContain('href="/privacy-policy"');

    // Check referral link using class instead of exact href matching to avoid JSDOM url normalization issues
    const referralLink = wrapper.find(".referral-link a");
    expect(referralLink.exists()).toBe(true);
    expect(referralLink.attributes("href")).toContain("moustachedesign.fyi");
    expect(referralLink.text()).toBe("Moustache Design");
  });

  it("renders social links with correct attributes for security", async () => {
    const wrapper = await mountSuspended(TheFooter);

    const socialLinks = wrapper.findAll(".social__icon a");
    expect(socialLinks.length).toBeGreaterThan(0);

    for (const link of socialLinks) {
      expect(link.attributes("rel")).toBe("noopener noreferrer");
      expect(link.attributes("target")).toBe("_blank");
    }
  });
});
