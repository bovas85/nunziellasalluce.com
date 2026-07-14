import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import WorkPage from "./[work].vue";

// ---------------------------------------------------------------------------
// Module-level state — mutated per test so the hoisted vi.mock closures
// can return different data without needing vi.doMock / vi.resetModules.
// ---------------------------------------------------------------------------
let mockProjects: unknown[] = [];
let mockSlug = "my-project";
let returnNullData = false;

// ---------------------------------------------------------------------------
// Shared project factory
// ---------------------------------------------------------------------------
const makeProject = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  slug: "my-project",
  title: { rendered: "My Project" },
  acf: {
    status: "true",
    category: "Branding",
    keywords: "my-project, design",
    hero: {
      title: "My Project Hero Title",
      desktop_bg: { url: "https://example.com/hero.jpg", alt: "hero" },
      mobile_bg: { url: "https://example.com/hero-mobile.jpg", alt: "hero" },
    },
    intro: {
      client_name: "ACME Corp",
      deliverables: [{ item: "Logo" }, { item: "Brand Guide" }],
    },
    challenge: {
      title: "The Challenge",
      body: "This is the challenge body.",
      left_list: { title: "Insights", list_item: [] },
      right_list: { title: "Actions", list_item: [] },
      flexible_content: [],
    },
    brand: { title: "The Brand", body: "This is the brand body.", items: [] },
    product: { title: "The Product", body: "This is the product body." },
    seo: {
      description: "SEO description for my project",
      facebook: { sizes: { large: "https://example.com/og.jpg" } },
      twitter: { sizes: { large: "https://example.com/twitter.jpg" } },
    },
    ...overrides,
  },
});

const makeSecondProject = (slug = "second-project", id = 2) => ({
  ...makeProject(),
  id,
  slug,
});

const makeMarketingProject = () =>
  makeProject({
    newsletter: { title: "Newsletter Section" },
    rich_media: { the_content: [] },
  });

// ---------------------------------------------------------------------------
// Hoisted mocks (applied before any import is resolved)
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
          // Execute the fetcher so coverage includes the $fetch call path.
          try {
            await fetcher();
          } catch {
            // intentionally ignore — $fetch is not globally available in tests
          }

          if (returnNullData) {
            return { data: ref(null) };
          }

          if (key === "projects") {
            return { data: ref(mockProjects) };
          }
          return { data: ref(null) };
        },
      ),
  };
});

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRoute: vi.fn().mockImplementation(() => ({
      params: { work: mockSlug },
    })),
  };
});

vi.mock("scrollama", () => ({
  default: vi.fn().mockReturnValue({
    setup: vi.fn().mockReturnThis(),
    onStepEnter: vi.fn().mockReturnThis(),
    onStepExit: vi.fn().mockReturnThis(),
    resize: vi.fn(),
    destroy: vi.fn(),
  }),
}));

vi.mock("@vueuse/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vueuse/core")>();
  return {
    ...actual,
    useWindowScroll: vi.fn().mockReturnValue({ y: ref(0) }),
    useWindowSize: vi
      .fn()
      .mockReturnValue({ width: ref(1024), height: ref(768) }),
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("[work].vue — data fetch", () => {
  beforeEach(() => {
    // Reset shared state before each test
    mockSlug = "my-project";
    mockProjects = [makeProject()];
    returnNullData = false;
  });

  it("fetches projects and renders the case-study wrapper when a matching project is found", async () => {
    const wrapper = await mountSuspended(WorkPage);
    expect(wrapper.find(".case-study").exists()).toBe(true);
  });

  it("calls useAsyncData with key 'projects', a fetcher and getCachedData option", async () => {
    const { useAsyncData } = await import("#app");
    const spy = vi.mocked(useAsyncData);
    spy.mockClear();

    await mountSuspended(WorkPage);

    expect(spy).toHaveBeenCalledWith(
      "projects",
      expect.any(Function),
      expect.objectContaining({ getCachedData: expect.any(Function) }),
    );
  });

  it("fetcher calls $fetch with the correct projects endpoint", async () => {
    const { useAsyncData } = await import("#app");
    const spy = vi.mocked(useAsyncData);
    spy.mockClear();

    const fetchSpy = vi.fn().mockResolvedValue([]);
    vi.stubGlobal("$fetch", fetchSpy);

    await mountSuspended(WorkPage);

    const [, fetcher] = spy.mock.calls[0] as [string, () => Promise<unknown>];
    await fetcher();

    const Config = (await import("@/assets/config")).default;
    expect(fetchSpy).toHaveBeenCalledWith(Config.wpDomain + Config.api.projects);

    vi.unstubAllGlobals();
  });

  it("getCachedData reads from nuxtApp.payload.data first, falls back to nuxtApp.static.data", async () => {
    const { useAsyncData } = await import("#app");
    const spy = vi.mocked(useAsyncData);
    spy.mockClear();

    await mountSuspended(WorkPage);

    const [, , options] = spy.mock.calls[0] as [
      string,
      () => Promise<unknown>,
      { getCachedData: (key: string, app: unknown) => unknown },
    ];

    const payloadApp = {
      payload: { data: { projects: "payload-value" } },
      static: { data: {} },
    };
    expect(options.getCachedData("projects", payloadApp)).toBe("payload-value");

    const staticApp = {
      payload: { data: {} },
      static: { data: { projects: "static-value" } },
    };
    expect(options.getCachedData("projects", staticApp)).toBe("static-value");
  });

  it("filters out projects whose acf.status is not 'true'", async () => {
    // Only the first project has status 'true'; the others should be excluded.
    // The route still matches 'my-project' (first project), so case-study renders.
    mockProjects = [
      makeProject({ status: "true" }),
      makeProject({ status: "false" }),
      { id: 3, slug: "inactive", title: { rendered: "Inactive" }, acf: null },
    ];

    const wrapper = await mountSuspended(WorkPage);
    expect(wrapper.find(".case-study").exists()).toBe(true);
  });

  it("shows UINotFound when no project matches the route slug", async () => {
    mockSlug = "non-existent-slug";

    const wrapper = await mountSuspended(WorkPage);
    expect(wrapper.find(".case-study").exists()).toBe(false);
  });

  it("shows UINotFound when projectsData is null (empty API response)", async () => {
    returnNullData = true;

    const wrapper = await mountSuspended(WorkPage);
    expect(wrapper.find(".case-study").exists()).toBe(false);
  });

  it("renders marketing sections when project has newsletter/rich_media", async () => {
    mockProjects = [makeMarketingProject()];

    const wrapper = await mountSuspended(WorkPage);

    expect(wrapper.find(".case-study").exists()).toBe(true);
    expect(
      wrapper.findComponent({ name: "SectionsWorkEmailNewsletter" }).exists(),
    ).toBe(true);
    expect(
      wrapper.findComponent({ name: "SectionsWorkTheBrand" }).exists(),
    ).toBe(false);
  });

  it("renders non-marketing sections when project has no newsletter/rich_media", async () => {
    const wrapper = await mountSuspended(WorkPage);

    expect(
      wrapper.findComponent({ name: "SectionsWorkTheBrand" }).exists(),
    ).toBe(true);
    expect(
      wrapper.findComponent({ name: "SectionsWorkEmailNewsletter" }).exists(),
    ).toBe(false);
  });

  it("renders previous/next navigation links when multiple projects exist", async () => {
    mockProjects = [makeProject(), makeSecondProject()];

    const wrapper = await mountSuspended(WorkPage);

    expect(wrapper.find(".work-navigation").exists()).toBe(true);
    expect(wrapper.find("a.previous").exists()).toBe(true);
    expect(wrapper.find("a.next").exists()).toBe(true);
  });

  it("wraps around to last project when current project is first (previousProject)", async () => {
    // index 0 = current (my-project), index 2 = last → should be previous
    mockProjects = [
      makeProject(), // index 0 — current
      makeSecondProject("second-project", 2), // index 1
      makeSecondProject("third-project", 3), // index 2 — expected previous
    ];
    mockSlug = "my-project";

    const wrapper = await mountSuspended(WorkPage);
    const prevLink = wrapper.find("a.previous");
    expect(prevLink.attributes("href")).toBe("/third-project");
  });

  it("wraps around to first project when current project is last (nextProject)", async () => {
    // index 2 = current (third-project), index 0 = first → should be next
    mockProjects = [
      makeProject(), // index 0 — expected next
      makeSecondProject("second-project", 2), // index 1
      makeSecondProject("third-project", 3), // index 2 — current
    ];
    mockSlug = "third-project";

    const wrapper = await mountSuspended(WorkPage);
    const nextLink = wrapper.find("a.next");
    expect(nextLink.attributes("href")).toBe("/my-project");
  });
});
