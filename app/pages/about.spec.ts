import { describe, it, expect, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import AboutPage from "./about.vue";
import UILazyImage from "~/components/UI/LazyImage.vue";

const mockRuntimeConfig = {
  public: {
    enableCvLivePreview: true,
    enableAboutBgQualityFix: true,
  },
};

vi.mock("#app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("#app")>();
  return {
    ...actual,
    useRuntimeConfig: vi.fn(() => mockRuntimeConfig),
    useAsyncData: vi.fn().mockReturnValue({
      data: ref({
        acf: {
          title: "Mocked About Me Title",
          about: {
            title: "About Section Title",
            body: "This is a mocked about section body text.",
            desktop_image: {
              id: 256,
              url: "https://example.com/desktop.jpg",
              sizes: {
                small: "https://example.com/desktop.jpg",
                medium: "https://example.com/desktop.jpg",
                large: "https://example.com/desktop-large.jpg",
                ultra: "https://example.com/desktop-ultra.jpg",
              },
            },
            mobile_image: {
              id: 607,
              url: "https://example.com/mobile.jpg",
              sizes: {
                small: "https://example.com/mobile.jpg",
                medium: "https://example.com/mobile.jpg",
                large: "https://example.com/mobile.jpg",
                ultra: "https://example.com/mobile.jpg",
              },
            },
          },
          current_job: {
            title: "Mock Current Job Title",
            body: "This is a mocked current job body.",
          },
          skills: {
            title: "Mock Skills Title",
            body: "This is a mocked skills body.",
          },
        },
      }),
    }),
  };
});

describe("About Page", () => {
  it("renders async fetched about section content", async () => {
    mockRuntimeConfig.public.enableCvLivePreview = true;
    mockRuntimeConfig.public.enableAboutBgQualityFix = true;
    const wrapper = await mountSuspended(AboutPage);
    expect(wrapper.text()).toContain("Mocked About Me Title");
    expect(wrapper.text()).toContain("About Section Title");
    expect(wrapper.text()).toContain(
      "This is a mocked about section body text.",
    );
  });

  it("contains a CV download link with secure attributes (noopener noreferrer)", async () => {
    mockRuntimeConfig.public.enableCvLivePreview = true;
    mockRuntimeConfig.public.enableAboutBgQualityFix = true;
    const wrapper = await mountSuspended(AboutPage);
    const link = wrapper.find("a.link");
    expect(link.exists()).toBe(true);
    expect(link.attributes("target")).toBe("_blank");
    expect(link.attributes("rel")).toBe("noopener noreferrer");
    expect(link.attributes("href")).toBe("/NunziellaSalluce-CV.pdf");
  });

  it("renders live scrollable CV preview image and container by default", async () => {
    mockRuntimeConfig.public.enableCvLivePreview = true;
    mockRuntimeConfig.public.enableAboutBgQualityFix = true;
    const wrapper = await mountSuspended(AboutPage);
    const container = wrapper.find(".cv-preview__container");
    expect(container.exists()).toBe(true);
    expect(container.attributes("role")).toBe("region");
    expect(container.attributes("aria-label")).toBe("Curriculum Vitae Preview");

    const img = wrapper.find("img.cv-preview__image");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("/NunziellaSalluce-CV-preview.png");
    expect(img.attributes("alt")).toBe("Curriculum Vitae of Nunziella Salluce");
    expect(img.attributes("loading")).toBe("lazy");

    const source = container.find("source");
    expect(source.exists()).toBe(true);
    expect(source.attributes("srcset")).toBe(
      "/NunziellaSalluce-CV-preview.webp",
    );
    expect(source.attributes("type")).toBe("image/webp");
  });

  it("hides live CV preview when enableCvLivePreview is false", async () => {
    mockRuntimeConfig.public.enableCvLivePreview = false;
    mockRuntimeConfig.public.enableAboutBgQualityFix = true;
    const wrapper = await mountSuspended(AboutPage);
    const container = wrapper.find(".cv-preview__container");
    expect(container.exists()).toBe(false);
    const link = wrapper.find("a.link");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("/NunziellaSalluce-CV.pdf");
  });

  it("applies high-quality bounded background styling and omits low-res mobile override when enableAboutBgQualityFix is true", async () => {
    mockRuntimeConfig.public.enableCvLivePreview = true;
    mockRuntimeConfig.public.enableAboutBgQualityFix = true;
    const wrapper = await mountSuspended(AboutPage);

    const root = wrapper.find(".about");
    expect(root.classes()).toContain("about--bg-quality-fix");

    const lazyImage = wrapper.findComponent(UILazyImage);
    expect(lazyImage.exists()).toBe(true);
    expect(lazyImage.props("highQuality")).toBe(true);
    expect(lazyImage.props("lazyload")).toBe(false);
    expect(lazyImage.props("positionMobile")).toBe("center-right");
    expect(lazyImage.props("imageMobile")).toBeUndefined();
  });

  it("falls back to legacy mobile image and full-height layout when enableAboutBgQualityFix is false", async () => {
    mockRuntimeConfig.public.enableCvLivePreview = true;
    mockRuntimeConfig.public.enableAboutBgQualityFix = false;
    const wrapper = await mountSuspended(AboutPage);

    const root = wrapper.find(".about");
    expect(root.classes()).not.toContain("about--bg-quality-fix");

    const lazyImage = wrapper.findComponent(UILazyImage);
    expect(lazyImage.exists()).toBe(true);
    expect(lazyImage.props("highQuality")).toBe(false);
    expect(lazyImage.props("lazyload")).toBe(true);
    expect(lazyImage.props("positionMobile")).toBe("right");
    expect(lazyImage.props("imageMobile")).toEqual(
      expect.objectContaining({ url: "https://example.com/mobile.jpg" }),
    );
  });
});
