import { describe, it, expect, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import ContactPage from "./contact.vue";

// ---------------------------------------------------------------------------
// Scrollama mock
// ---------------------------------------------------------------------------
vi.mock("scrollama", () => ({
  default: vi.fn().mockImplementation(() => ({
    setup: vi.fn().mockReturnThis(),
    onStepEnter: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    resize: vi.fn(),
  })),
}));

// ---------------------------------------------------------------------------
// #app mock — uses mockImplementation so the fetcher + getCachedData are hit
// ---------------------------------------------------------------------------
vi.mock("#app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("#app")>();
  return {
    ...actual,
    useAsyncData: vi
      .fn()
      .mockImplementation(
        async (
          _key: string,
          fetcher: () => Promise<unknown>,
          _options?: unknown,
        ) => {
          try {
            await fetcher();
          } catch {
            // $fetch is not globally mocked — ignore network errors
          }
          return {
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
          };
        },
      ),
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Contact Page", () => {
  it("renders fetched contact section title and form cleanly", async () => {
    const wrapper = await mountSuspended(ContactPage);
    expect(wrapper.text()).toContain("Get in Touch");
    expect(wrapper.find(".contact-form").exists()).toBe(true);
  });

  it("executes the $fetch callback inside useAsyncData (coverage path)", async () => {
    const { useAsyncData } = await import("#app");
    const spy = vi.mocked(useAsyncData);
    spy.mockClear();

    await mountSuspended(ContactPage);

    expect(spy).toHaveBeenCalledWith(
      "contactPage",
      expect.any(Function),
      expect.objectContaining({ getCachedData: expect.any(Function) }),
    );
  });

  it("getCachedData reads from payload first, falls back to static", async () => {
    const { useAsyncData } = await import("#app");
    const spy = vi.mocked(useAsyncData);
    spy.mockClear();

    await mountSuspended(ContactPage);

    const [, , options] = spy.mock.calls[0] as [
      string,
      () => Promise<unknown>,
      { getCachedData: (key: string, app: unknown) => unknown },
    ];

    const payloadApp = {
      payload: { data: { contactPage: "payload-value" } },
      static: { data: {} },
    };
    expect(options.getCachedData("contactPage", payloadApp)).toBe(
      "payload-value",
    );

    const staticApp = {
      payload: { data: {} },
      static: { data: { contactPage: "static-value" } },
    };
    expect(options.getCachedData("contactPage", staticApp)).toBe(
      "static-value",
    );
  });

  it("does not initialise scrollama when not running in client environment", async () => {
    const scrollama = (await import("scrollama")).default;
    vi.mocked(scrollama).mockClear();

    await mountSuspended(ContactPage);

    // import.meta.client is false in the Nuxt test environment,
    // so the scrollama setup block inside onMounted is never reached.
    expect(vi.mocked(scrollama)).not.toHaveBeenCalled();
  });

  it("onBeforeUnmount is a no-op when contactScroller was never initialised", async () => {
    // When import.meta.client is false, contactScroller stays null.
    // Unmounting should not throw.
    const wrapper = await mountSuspended(ContactPage);
    expect(() => wrapper.unmount()).not.toThrow();
  });
});
