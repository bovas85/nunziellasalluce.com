import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import TheFooter from "./TheFooter.vue";
import FootersBadge from "./Badge.vue";
import IconsTheLogoStatic from "../Icons/TheLogoStatic.vue";

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

    // Check referral link
    const referralLink = wrapper.find('a[href="https://moustachedesign.xyz?referrer=nunziella-salluce-design"]');
    expect(referralLink.exists()).toBe(true);
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
