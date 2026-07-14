import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import TheAwards from "./TheAwards.vue";

describe("TheAwards", () => {
  it("renders the awards section correctly", async () => {
    const wrapper = await mountSuspended(TheAwards);

    // Check main section
    const section = wrapper.find("section.awards.step");
    expect(section.exists()).toBe(true);

    // Check headings
    const h1 = wrapper.find("h1");
    expect(h1.exists()).toBe(true);
    expect(h1.text()).toBe("Awards");

    const h3 = wrapper.find("h3");
    expect(h3.exists()).toBe(true);
    expect(h3.text()).toContain("I was nominated by public vote for best UI, UX and Innovation");

    // Check images
    const images = wrapper.findAll("img");
    expect(images).toHaveLength(3);

    // UI Award
    expect(images[0].attributes("src")).toBe("/images/best-ui-black.png");
    expect(images[0].attributes("alt")).toBe("Best UI Design award from CSS Design Awards");
    expect(images[0].attributes("title")).toBe("UI Design award from CSS Design Awards");
    expect(images[0].attributes("loading")).toBe("lazy");

    // Innovation Award
    expect(images[1].attributes("src")).toBe("/images/best-innovation-purple.png");
    expect(images[1].attributes("alt")).toBe("Best Innovation Design award from CSS Design Awards");
    expect(images[1].attributes("title")).toBe("Innovation Design award from CSS Design Awards");
    expect(images[1].attributes("loading")).toBe("lazy");

    // UX Award
    expect(images[2].attributes("src")).toBe("/images/best-ux-black.png");
    expect(images[2].attributes("alt")).toBe("Best UX Design award from CSS Design Awards");
    expect(images[2].attributes("title")).toBe("UX Design award from CSS Design Awards");
    expect(images[2].attributes("loading")).toBe("lazy");
  });
});
