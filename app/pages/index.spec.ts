import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import IndexPage from "./index.vue";

// ---------------------------------------------------------------------------
// Shared state for scrollama step-enter callback
// ---------------------------------------------------------------------------
let capturedOnStepEnter: ((response: { index: number }) => void) | null = null;

// ---------------------------------------------------------------------------
// Scrollama mock
// ---------------------------------------------------------------------------
vi.mock("scrollama", () => ({
  default: vi.fn().mockImplementation(() => ({
    setup: vi.fn().mockReturnThis(),
    onStepEnter: vi.fn().mockImplementation((cb) => {
      capturedOnStepEnter = cb;
      return { destroy: vi.fn(), resize: vi.fn() };
    }),
    destroy: vi.fn(),
    resize: vi.fn(),
  })),
}));

// ---------------------------------------------------------------------------
// vue-router mock with controllable hash
// ---------------------------------------------------------------------------
let mockHash = "";

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRoute: vi.fn().mockImplementation(() => ({
      hash: mockHash,
    })),
  };
});

// ---------------------------------------------------------------------------
// #app mock
// ---------------------------------------------------------------------------
vi.mock("#app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("#app")>();
  return {
    ...actual,
    useAsyncData: vi
      .fn()
      .mockImplementation(
        async (
          key: string,
          fetcher: () => Promise<unknown>,
          _options?: unknown,
        ) => {
          try {
            await fetcher();
          } catch {
            // $fetch is not globally mocked — ignore network errors
          }

          if (key === "homePage") {
            return {
              data: ref({
                acf: {
                  hero: {
                    title: "Mocked Hero Title",
                    description: "Mocked Hero Description",
                  },
                  who_i_am: {
                    title: "Mocked Who I Am Title",
                    text_group: [],
                  },
                  the_process: {
                    title: "Mocked Process Title",
                    processes: [],
                  },
                  capabilities: {
                    title: "Mocked Capabilities Title",
                    media_object: {
                      image: {
                        sizes: { large: "http://example.com/large.jpg" },
                        alt: "mock alt",
                      },
                    },
                    media_object2: {
                      image: {
                        sizes: { large: "http://example.com/large2.jpg" },
                        alt: "mock alt 2",
                      },
                    },
                    media_object3: {
                      image: {
                        sizes: { large: "http://example.com/large3.jpg" },
                        alt: "mock alt 3",
                      },
                    },
                    skills: [],
                  },
                  case_studies: {
                    title: "Mocked Case Studies Title",
                    order: [2, 1],
                  },
                  testimonials: { testimonials: [] },
                },
              }),
            };
          } else if (key === "projects") {
            return {
              data: ref([
                {
                  id: 1,
                  slug: "/project-one",
                  title: { rendered: "Project One" },
                  acf: {
                    status: "true",
                    category: "Web Development",
                    product: "Website",
                    hero: {
                      title: "Project One Hero Title",
                      desktop_bg: {
                        url: "http://example.com/proj1.jpg",
                        alt: "proj1",
                      },
                      mobile_bg: {
                        url: "http://example.com/proj1-mobile.jpg",
                        alt: "proj1",
                      },
                    },
                  },
                },
                {
                  id: 2,
                  slug: "/project-two",
                  title: { rendered: "Project Two" },
                  acf: {
                    status: "true",
                    category: "App Development",
                    product: "App",
                    hero: {
                      title: "Project Two Hero Title",
                      desktop_bg: {
                        url: "http://example.com/proj2.jpg",
                        alt: "proj2",
                      },
                      mobile_bg: {
                        url: "http://example.com/proj2-mobile.jpg",
                        alt: "proj2",
                      },
                    },
                  },
                },
              ]),
            };
          }
          return { data: ref(null) };
        },
      ),
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Index Page", () => {
  beforeEach(() => {
    capturedOnStepEnter = null;
    mockHash = "";
  });

  it("renders async fetched projects and home page content", async () => {
    const wrapper = await mountSuspended(IndexPage);

    expect(wrapper.text()).toContain("Mocked Case Studies Title");
    expect(wrapper.text()).toContain("Project One Hero Title");
    expect(wrapper.text()).toContain("Project Two Hero Title");
  });

  it("executes both $fetch callbacks inside useAsyncData (coverage path)", async () => {
    const { useAsyncData } = await import("#app");
    const spy = vi.mocked(useAsyncData);
    spy.mockClear();

    const originalFetch = globalThis.$fetch;
    globalThis.$fetch = vi.fn().mockResolvedValue({});

    await mountSuspended(IndexPage);

    const keys = spy.mock.calls.map(([k]) => k);
    expect(keys).toContain("homePage");
    expect(keys).toContain("projects");

    // The component defines useAsyncData with keys "homePage" and "projects"
    // and calls fetcher inside our mock. Let's verify our mocked $fetch was called.
    expect(globalThis.$fetch).toHaveBeenCalledWith(
      expect.stringContaining("casestudies")
    );

    globalThis.$fetch = originalFetch;
  });

  it("getCachedData reads from payload first, falls back to static (homePage)", async () => {
    const { useAsyncData } = await import("#app");
    const spy = vi.mocked(useAsyncData);
    spy.mockClear();

    await mountSuspended(IndexPage);

    const homePageCall = spy.mock.calls.find(([k]) => k === "homePage") as [
      string,
      () => Promise<unknown>,
      { getCachedData: (key: string, app: unknown) => unknown },
    ];

    const [, , options] = homePageCall;

    expect(
      options.getCachedData("homePage", {
        payload: { data: { homePage: "payload-val" } },
        static: { data: {} },
      }),
    ).toBe("payload-val");

    expect(
      options.getCachedData("homePage", {
        payload: { data: {} },
        static: { data: { homePage: "static-val" } },
      }),
    ).toBe("static-val");
  });

  it("getCachedData reads from payload first, falls back to static (projects)", async () => {
    const { useAsyncData } = await import("#app");
    const spy = vi.mocked(useAsyncData);
    spy.mockClear();

    await mountSuspended(IndexPage);

    const projectsCall = spy.mock.calls.find(([k]) => k === "projects") as [
      string,
      () => Promise<unknown>,
      { getCachedData: (key: string, app: unknown) => unknown },
    ];

    const [, , options] = projectsCall;

    expect(
      options.getCachedData("projects", {
        payload: { data: { projects: "payload-val" } },
        static: { data: {} },
      }),
    ).toBe("payload-val");

    expect(
      options.getCachedData("projects", {
        payload: { data: {} },
        static: { data: { projects: "static-val" } },
      }),
    ).toBe("static-val");
  });

  it("fires step animation for WhoIAm (index 1) via scrollama onStepEnter", async () => {
    await mountSuspended(IndexPage);
    expect(capturedOnStepEnter).not.toBeNull();
    // Trigger step 1 — should set animateWho; no error thrown
    capturedOnStepEnter!({ index: 1 });
  });

  it("fires step animations for all tracked step indices without error", async () => {
    await mountSuspended(IndexPage);
    expect(capturedOnStepEnter).not.toBeNull();
    // Indices 1–5 are mapped in stepAnimations; index 0 and 6+ are no-ops
    for (const index of [0, 1, 2, 3, 4, 5, 6]) {
      expect(() => capturedOnStepEnter!({ index })).not.toThrow();
    }
  });

  it("cleans up scrollama and resize listener on unmount", async () => {
    const scrollama = (await import("scrollama")).default;
    const mockDestroy = vi.fn();
    const mockResize = vi.fn();
    vi.mocked(scrollama).mockReturnValueOnce({
      setup: vi.fn().mockReturnThis(),
      onStepEnter: vi.fn().mockReturnThis(),
      destroy: mockDestroy,
      resize: mockResize,
    } as ReturnType<typeof scrollama>);

    const wrapper = await mountSuspended(IndexPage);
    wrapper.unmount();

    expect(mockDestroy).toHaveBeenCalled();
  });

  it("scrolls to hash element when route.hash is set", async () => {
    mockHash = "#work";
    const scrollToSpy = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => {});
    const scrollIntoViewSpy = vi.fn();
    const mockEl = { scrollIntoView: scrollIntoViewSpy };
    vi.spyOn(document, "querySelector").mockImplementation((sel) =>
      sel === "#work" ? (mockEl as unknown as Element) : null,
    );

    await mountSuspended(IndexPage);
    await new Promise((r) => setTimeout(r, 0)); // flush microtasks

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: "smooth" });

    scrollToSpy.mockRestore();
    vi.mocked(document.querySelector).mockRestore?.();
  });
});
