import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import TheCapabilities from "./TheCapabilities.vue";
import type { HomePageACF } from "~/types/acf";

describe("TheCapabilities", () => {
  const mockACF = {
    capabilities: {
      title: "My Capabilities",
      media_object: {
        title: "Capability 1",
        body: "Description for capability 1.",
        image: {
          alt: "Image 1 alt",
          sizes: {
            large: "https://example.com/cap1.jpg"
          }
        }
      },
      media_object2: {
        title: "Capability 2",
        body: "Description for capability 2.",
        image: {
          alt: "Image 2 alt",
          sizes: {
            large: "https://example.com/cap2.jpg"
          }
        }
      },
      media_object3: {
        title: "Capability 3",
        body: "Description for capability 3.",
        image: {
          alt: "Image 3 alt",
          sizes: {
            large: "https://example.com/cap3.jpg"
          }
        }
      }
    }
  } as unknown as HomePageACF;

  it("renders correctly with provided ACF data", async () => {
    const wrapper = await mountSuspended(TheCapabilities, {
      props: {
        acf: mockACF,
        animateCapab: false,
      }
    });

    // Check main title
    expect(wrapper.find("h1").text()).toBe("My Capabilities");

    // Check individual capabilities
    const skills = wrapper.findAll(".skill");
    expect(skills.length).toBe(3);

    // Skill 1
    const skill1 = skills[0];
    expect(skill1.find("h3").text()).toBe("Capability 1");
    expect(skill1.find("p").text()).toBe("Description for capability 1.");
    const img1 = skill1.find("img");
    expect(img1.attributes("data-src")).toBe("https://example.com/cap1.jpg");
    expect(img1.attributes("alt")).toBe("Image 1 alt");

    // Skill 2
    const skill2 = skills[1];
    expect(skill2.find("h3").text()).toBe("Capability 2");
    expect(skill2.find("p").text()).toBe("Description for capability 2.");
    const img2 = skill2.find("img");
    expect(img2.attributes("data-src")).toBe("https://example.com/cap2.jpg");
    expect(img2.attributes("alt")).toBe("Image 2 alt");

    // Skill 3
    const skill3 = skills[2];
    expect(skill3.find("h3").text()).toBe("Capability 3");
    expect(skill3.find("p").text()).toBe("Description for capability 3.");
    const img3 = skill3.find("img");
    expect(img3.attributes("data-src")).toBe("https://example.com/cap3.jpg");
    expect(img3.attributes("alt")).toBe("Image 3 alt");
  });

  it("applies animation classes when animateCapab is true", async () => {
    const wrapper = await mountSuspended(TheCapabilities, {
      props: {
        acf: mockACF,
        animateCapab: true,
      }
    });

    expect(wrapper.find("h1").classes()).toContain("animated");

    const skills = wrapper.findAll(".skill");
    skills.forEach(skill => {
      expect(skill.classes()).toContain("animated");
    });
  });

  it("does not apply animation classes when animateCapab is false", async () => {
    const wrapper = await mountSuspended(TheCapabilities, {
      props: {
        acf: mockACF,
        animateCapab: false,
      }
    });

    expect(wrapper.find("h1").classes()).not.toContain("animated");

    const skills = wrapper.findAll(".skill");
    skills.forEach(skill => {
      expect(skill.classes()).not.toContain("animated");
    });
  });

  it("does not render when acf is missing", async () => {
    const wrapper = await mountSuspended(TheCapabilities, {
      props: {
        acf: undefined as unknown as HomePageACF,
        animateCapab: false,
      }
    });

    expect(wrapper.find("section.capabilities").exists()).toBe(false);
  });
});
