import { describe, it, expect, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import AboutPage from "./about.vue";

const mockRuntimeConfig = {
  public: {
    enableCvLivePreview: true,
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
              url: "https://example.com/desktop.jpg",
              sizes: {
                small: "https://example.com/desktop.jpg",
                medium: "https://example.com/desktop.jpg",
                large: "https://example.com/desktop.jpg",
                ultra: "https://example.com/desktop.jpg",
              },
            },
            mobile_image: {
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
    const wrapper = await mountSuspended(AboutPage);
    expect(wrapper.text()).toContain("Mocked About Me Title");
    expect(wrapper.text()).toContain("About Section Title");
    expect(wrapper.text()).toContain(
      "This is a mocked about section body text.",
    );
  });

  it("contains a CV download link with secure attributes (noopener noreferrer)", async () => {
    mockRuntimeConfig.public.enableCvLivePreview = true;
    const wrapper = await mountSuspended(AboutPage);
    const link = wrapper.find("a.link");
    expect(link.exists()).toBe(true);
    expect(link.attributes("target")).toBe("_blank");
    expect(link.attributes("rel")).toBe("noopener noreferrer");
    expect(link.attributes("href")).toBe("/NunziellaSalluce-CV.pdf");
  });

  it("renders live scrollable CV preview image and container by default", async () => {
    mockRuntimeConfig.public.enableCvLivePreview = true;
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
    const wrapper = await mountSuspended(AboutPage);
    const container = wrapper.find(".cv-preview__container");
    expect(container.exists()).toBe(false);
    const link = wrapper.find("a.link");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("/NunziellaSalluce-CV.pdf");
  });
});
