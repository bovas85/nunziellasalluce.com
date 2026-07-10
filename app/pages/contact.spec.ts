import { describe, it, expect, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import ContactPage from "./contact.vue";

vi.mock("#app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("#app")>();
  return {
    ...actual,
    useAsyncData: vi.fn().mockReturnValue({
      data: ref({
        acf: {
          title: "Get in Touch",
          background: {
            url: "https://example.com/bg.jpg",
            sizes: {
              small: "https://example.com/bg.jpg",
              medium: "https://example.com/bg.jpg",
              large: "https://example.com/bg.jpg",
              ultra: "https://example.com/bg.jpg",
            },
          },
        },
      }),
    }),
  };
});

describe("Contact Page", () => {
  it("renders fetched contact section title and form cleanly", async () => {
    const wrapper = await mountSuspended(ContactPage);
    expect(wrapper.text()).toContain("Get in Touch");
    expect(wrapper.find(".contact-form").exists()).toBe(true);
  });
});
