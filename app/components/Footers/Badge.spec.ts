import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import Badge from "./Badge.vue";

describe("Badge", () => {
  it("renders correctly with proper link attributes", async () => {
    const wrapper = await mountSuspended(Badge);

    const link = wrapper.find("a#cssda-badge");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe(
      "https://www.cssdesignawards.com/sites/nunziella-salluce-design/35044/"
    );
    expect(link.attributes("target")).toBe("_blank");
    expect(link.attributes("rel")).toBe("noopener noreferrer");
    expect(link.attributes("aria-label")).toBe(
      "Go to my entry for the css design awards website"
    );

    const logoSvg = wrapper.find("#cssda-badge-logo");
    expect(logoSvg.exists()).toBe(true);

    const contentDiv = wrapper.find(".cssda-badge-content");
    expect(contentDiv.exists()).toBe(true);

    const titleSvg = wrapper.find("#cssda-badge-title");
    expect(titleSvg.exists()).toBe(true);

    const awardSvg = wrapper.find("#cssda-badge-award");
    expect(awardSvg.exists()).toBe(true);
  });
});
