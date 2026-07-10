import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import LazyImage from "./LazyImage.vue";
import type { WPImage } from "~/types/acf";

describe("LazyImage", () => {
  const defaultImage = {
    id: 1,
    url: "https://example.com/desktop.jpg",
    sizes: {
      small: "https://example.com/desktop-small.jpg",
      medium: "https://example.com/desktop-medium.jpg",
      large: "https://example.com/desktop-large.jpg",
      ultra: "https://example.com/desktop-ultra.jpg",
      "4k": "https://example.com/desktop-4k.jpg",
    },
  } as unknown as WPImage;

  const customMobileImage = {
    id: 2,
    url: "https://example.com/mobile-crop.jpg",
    sizes: {
      medium: "https://example.com/mobile-crop-medium.jpg",
    },
  } as unknown as WPImage;

  it("renders a picture tag when image is provided", () => {
    const wrapper = mount(LazyImage, {
      props: {
        image: defaultImage,
      },
    });
    expect(wrapper.find("picture").exists()).toBe(true);
    expect(wrapper.find("img").exists()).toBe(true);
  });

  it("uses custom mobile image when provided and distinct", () => {
    const wrapper = mount(LazyImage, {
      props: {
        image: defaultImage,
        imageMobile: customMobileImage,
      },
    });
    const sources = wrapper.findAll("source");
    const mobileSource = sources.find(
      (s) =>
        s.attributes("media") === "(max-width: 576px)" && !s.attributes("type"),
    );
    expect(mobileSource?.attributes("data-srcset")).toBe(customMobileImage.url);
  });

  it("falls back to medium desktop size when no custom mobile image is provided", () => {
    const wrapper = mount(LazyImage, {
      props: {
        image: defaultImage,
        imageMobile: undefined,
      },
    });
    const sources = wrapper.findAll("source");
    const mobileSource = sources.find(
      (s) =>
        s.attributes("media") === "(max-width: 576px)" && !s.attributes("type"),
    );
    expect(mobileSource?.attributes("data-srcset")).toBe(
      defaultImage.sizes.medium,
    );
  });

  it("forces Bio-Nunziella-Salluce-Design-mobile.jpg for the bio photo", () => {
    const bioImage = {
      id: 256,
      url: "https://nunziella.moustachedesign.xyz/wp-content/uploads/2018/08/Bio-Nunziella-Salluce-Design.jpg",
      sizes: {
        medium:
          "https://nunziella.moustachedesign.xyz/wp-content/uploads/2018/08/Bio-Nunziella-Salluce-Design-1024x647.jpg",
      },
    } as unknown as WPImage;
    const wrapper = mount(LazyImage, {
      props: {
        image: bioImage,
        imageMobile: undefined,
      },
    });
    const sources = wrapper.findAll("source");
    const mobileSource = sources.find(
      (s) =>
        s.attributes("media") === "(max-width: 576px)" && !s.attributes("type"),
    );
    expect(mobileSource?.attributes("data-srcset")).toBe(
      "https://nunziella.moustachedesign.xyz/wp-content/uploads/2019/05/Bio-Nunziella-Salluce-Design-mobile.jpg",
    );
  });

  it("calls lazySizes.loader.checkElems on mount", async () => {
    const mockCheckElems = vi.fn();
    const globalObj = globalThis as unknown as {
      lazySizes?: {
        loader: {
          checkElems: () => void;
        };
      };
    };
    globalObj.lazySizes = {
      loader: {
        checkElems: mockCheckElems,
      },
    };

    mount(LazyImage, {
      props: {
        image: defaultImage,
      },
    });

    // Wait for nextTick / promise resolution
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockCheckElems).toHaveBeenCalled();
    delete globalObj.lazySizes;
  });

  it("renders original src/srcset directly when lazyload is false", () => {
    const wrapper = mount(LazyImage, {
      props: {
        image: defaultImage,
        lazyload: false,
      },
    });

    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe(defaultImage.sizes.ultra);
    expect(img.attributes("data-src")).toBeUndefined();

    const sources = wrapper.findAll("source");
    const desktopSource = sources.find(
      (s) =>
        s.attributes("media") ===
          "(min-width: 1024px) and (max-width: 1920px)" &&
        !s.attributes("type"),
    );
    expect(desktopSource?.attributes("srcset")).toBe(defaultImage.sizes.ultra);
    expect(desktopSource?.attributes("data-srcset")).toBeUndefined();
  });
});
