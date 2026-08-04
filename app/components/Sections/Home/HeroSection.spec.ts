import { describe, it, expect, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import HeroSection from "./HeroSection.vue";
import type { HomePageACF } from "~/types/acf";

describe("HeroSection", () => {
  const mockACF = {
    hero: {
      title: "Hero Title",
      description: "Hero Description",
      desktop_bg: {
        alt: "Desktop BG",
        sizes: {
          large: "desktop.jpg"
        }
      },
      mobile_bg: {
        alt: "Mobile BG",
        sizes: {
          large: "mobile.jpg"
        }
      }
    }
  } as unknown as HomePageACF;

  it("renders correctly when acf is provided", async () => {
    const wrapper = await mountSuspended(HeroSection, {
      props: {
        acf: mockACF,
        animateHeader: false
      }
    });

    expect(wrapper.find("section.hero").exists()).toBe(true);
    expect(wrapper.find("h1").text()).toBe("Hero Title");
    expect(wrapper.find("h3").text()).toBe("Hero Description");
  });

  it("applies animated class when animateHeader is true", async () => {
    const wrapper = await mountSuspended(HeroSection, {
      props: {
        acf: mockACF,
        animateHeader: true
      }
    });

    const container = wrapper.find(".container.is-flex-column");
    expect(container.classes()).toContain("animated");
  });

  it("does not apply animated class when animateHeader is false", async () => {
    const wrapper = await mountSuspended(HeroSection, {
      props: {
        acf: mockACF,
        animateHeader: false
      }
    });

    const container = wrapper.find(".container.is-flex-column");
    expect(container.classes()).not.toContain("animated");
  });

  it("scrolls to who-i-am section when scroll-down is clicked", async () => {
    const mockScrollIntoView = vi.fn();
    const querySelectorSpy = vi.spyOn(document, "querySelector").mockImplementation((selector) => {
      if (selector === ".who-i-am") {
        return { scrollIntoView: mockScrollIntoView } as unknown as Element;
      }
      return null;
    });

    const wrapper = await mountSuspended(HeroSection, {
      props: {
        acf: mockACF,
        animateHeader: false
      }
    });

    await wrapper.find(".scroll-down").trigger("click");

    expect(querySelectorSpy).toHaveBeenCalledWith(".who-i-am");
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });

    querySelectorSpy.mockRestore();
  });

  it("scrolls to projects section when rotating-text is clicked", async () => {
    const mockScrollIntoView = vi.fn();
    const querySelectorSpy = vi.spyOn(document, "querySelector").mockImplementation((selector) => {
      if (selector === ".projects") {
        return { scrollIntoView: mockScrollIntoView } as unknown as Element;
      }
      return null;
    });

    const wrapper = await mountSuspended(HeroSection, {
      props: {
        acf: mockACF,
        animateHeader: false
      }
    });

    await wrapper.find(".rotating-text").trigger("click");

    expect(querySelectorSpy).toHaveBeenCalledWith(".projects");
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });

    querySelectorSpy.mockRestore();
  });

  it("does not render hero section when acf is undefined", async () => {
    const wrapper = await mountSuspended(HeroSection, {
      props: {
        acf: undefined as unknown as HomePageACF,
        animateHeader: false
      }
    });

    expect(wrapper.find("section.hero").exists()).toBe(false);
  });
});
