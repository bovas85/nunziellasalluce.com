import { describe, it, expect, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import AboutPage from "./about.vue";

vi.mock("#app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("#app")>();
  return {
    ...actual,
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
    const wrapper = await mountSuspended(AboutPage);
    expect(wrapper.text()).toContain("Mocked About Me Title");
    expect(wrapper.text()).toContain("About Section Title");
    expect(wrapper.text()).toContain(
      "This is a mocked about section body text.",
    );
  });
});
