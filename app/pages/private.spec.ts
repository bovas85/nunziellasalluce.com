import { beforeEach, describe, expect, it, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import PrivatePage from "./private.vue";

// ---------------------------------------------------------------------------
// Module-level state — mutated per test
// ---------------------------------------------------------------------------
let mockProjects: unknown[] = [];
let mockAuthData = { authenticated: false };
let mockRuntimeConfig = {
  public: {
    ENABLE_PRIVATE_CASE_STUDY_ROUTE: true,
  },
};
let mockQuery: Record<string, string> = {};

// ---------------------------------------------------------------------------
// Project factory
// ---------------------------------------------------------------------------
const makePrivateProject = (overrides: Record<string, unknown> = {}) => ({
  id: 999,
  slug: "private",
  title: { rendered: "Custom Private Study" },
  acf: {
    status: "true",
    category: "Branding & Strategy",
    keywords: "custom, private, design",
    hero: {
      title: "Custom Private Hero Title",
      desktop_bg: { url: "https://example.com/custom-hero.jpg", alt: "hero" },
      mobile_bg: {
        url: "https://example.com/custom-hero-mobile.jpg",
        alt: "hero",
      },
    },
    intro: {
      client_name: "Confidential Brand",
      deliverables: [{ item: "Strategy" }, { item: "Creative" }],
    },
    newsletter: {
      title: "Newsletter Section",
      image_left: { url: "https://example.com/news-left.jpg", alt: "left" },
      image_right: {
        url: "https://example.com/news-right.jpg",
        alt: "right",
      },
    },
    infographics: {
      title: "Infographics Section",
      image_top: false,
      image_bottom: false,
    },
    rich_media: {
      the_content: [{ acf_fc_layout: "text", text: "Rich content" }],
    },
    seo: {
      description: "Custom SEO description",
      facebook: { sizes: { large: "https://example.com/og.jpg" } },
      twitter: { sizes: { large: "https://example.com/twitter.jpg" } },
    },
    ...overrides,
  },
});

const makeNeighborProject = (slug: string, id: number) => ({
  id,
  slug,
  title: { rendered: slug },
  acf: {
    status: "true",
    hero: {
      title: `${slug} title`,
      desktop_bg: { url: `https://example.com/${slug}.jpg`, alt: slug },
      mobile_bg: { url: `https://example.com/${slug}-mob.jpg`, alt: slug },
    },
  },
});

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------
const { mockResize, mockDestroy, scrollamaState } = vi.hoisted(() => {
  return {
    mockResize: vi.fn(),
    mockDestroy: vi.fn(),
    scrollamaState: {
      onStepEnter: null as ((response: unknown) => void) | null,
      onStepExit: null as ((response: unknown) => void) | null,
    },
  };
});

vi.mock("#app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("#app")>();
  return {
    ...actual,
    useRuntimeConfig: vi.fn(() => mockRuntimeConfig),
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
            // ignore fetch errors in tests
          }

          if (key === "projects") {
            return { data: ref(mockProjects), refresh: vi.fn() };
          }
          if (key === "case-study-auth") {
            return {
              data: ref(mockAuthData),
              refresh: vi.fn().mockImplementation(async () => {
                mockAuthData = { authenticated: true };
              }),
            };
          }
          return { data: ref(null), refresh: vi.fn() };
        },
      ),
  };
});

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRoute: vi.fn().mockImplementation(() => ({
      path: "/private",
      query: mockQuery,
    })),
  };
});

vi.mock("scrollama", () => ({
  default: vi.fn().mockReturnValue({
    setup: vi.fn().mockImplementation(() => {
      return {
        onStepEnter: vi.fn().mockImplementation((cb) => {
          scrollamaState.onStepEnter = cb;
          return {
            onStepExit: vi.fn().mockImplementation((exitCb) => {
              scrollamaState.onStepExit = exitCb;
              return {
                resize: mockResize,
                destroy: mockDestroy,
              };
            }),
          };
        }),
      };
    }),
    resize: mockResize,
    destroy: mockDestroy,
  }),
}));

vi.mock("@vueuse/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vueuse/core")>();
  return {
    ...actual,
    useWindowScroll: vi.fn().mockReturnValue({ y: ref(0) }),
  };
});

// ---------------------------------------------------------------------------
// Test Suites
// ---------------------------------------------------------------------------
describe("private.vue", () => {
  beforeEach(() => {
    mockProjects = [];
    mockAuthData = { authenticated: false };
    mockRuntimeConfig = {
      public: {
        ENABLE_PRIVATE_CASE_STUDY_ROUTE: true,
      },
    };
    mockQuery = {};
    scrollamaState.onStepEnter = null;
    scrollamaState.onStepExit = null;
    vi.clearAllMocks();
  });

  describe("Feature flag toggle (ENABLE_PRIVATE_CASE_STUDY_ROUTE)", () => {
    it("renders UINotFound when ENABLE_PRIVATE_CASE_STUDY_ROUTE is false", async () => {
      mockRuntimeConfig.public.ENABLE_PRIVATE_CASE_STUDY_ROUTE = false;
      const wrapper = await mountSuspended(PrivatePage);

      expect(wrapper.findComponent({ name: "UINotFound" }).exists()).toBe(true);
      expect(
        wrapper.findComponent({ name: "CaseStudyPasswordGate" }).exists(),
      ).toBe(false);
      expect(wrapper.find(".case-study.private").exists()).toBe(false);
    });

    it("renders password gate or case study when ENABLE_PRIVATE_CASE_STUDY_ROUTE is true", async () => {
      mockRuntimeConfig.public.ENABLE_PRIVATE_CASE_STUDY_ROUTE = true;
      const wrapper = await mountSuspended(PrivatePage);

      expect(
        wrapper.findComponent({ name: "CaseStudyPasswordGate" }).exists(),
      ).toBe(true);
    });
  });

  describe("Password Gate & Authentication Integration", () => {
    it("renders CaseStudyPasswordGate when unauthenticated", async () => {
      mockAuthData = { authenticated: false };
      const wrapper = await mountSuspended(PrivatePage);

      const gate = wrapper.findComponent({ name: "CaseStudyPasswordGate" });
      expect(gate.exists()).toBe(true);
      expect(gate.props("projectTitle")).toBe("private");
      expect(wrapper.find(".case-study.private").exists()).toBe(false);
    });

    it("renders the unlocked case study directly when authenticated", async () => {
      mockAuthData = { authenticated: true };
      const wrapper = await mountSuspended(PrivatePage);

      expect(
        wrapper.findComponent({ name: "CaseStudyPasswordGate" }).exists(),
      ).toBe(false);
      expect(wrapper.find(".case-study.private").exists()).toBe(true);
      expect(wrapper.findComponent({ name: "SectionsWorkHero" }).exists()).toBe(
        true,
      );
    });

    it("forces password gate when preview_gate query parameter is 1 even if authenticated", async () => {
      mockAuthData = { authenticated: true };
      mockQuery = { preview_gate: "1" };
      const wrapper = await mountSuspended(PrivatePage);

      expect(
        wrapper.findComponent({ name: "CaseStudyPasswordGate" }).exists(),
      ).toBe(true);
    });

    it("unlocks the case study and initializes animations when gate emits unlocked event", async () => {
      mockAuthData = { authenticated: false };
      const wrapper = await mountSuspended(PrivatePage);

      const gate = wrapper.findComponent({ name: "CaseStudyPasswordGate" });
      expect(gate.exists()).toBe(true);

      await gate.vm.$emit("unlocked");
      await wrapper.vm.$nextTick();

      expect(
        wrapper.findComponent({ name: "CaseStudyPasswordGate" }).exists(),
      ).toBe(false);
      expect(wrapper.find(".case-study.private").exists()).toBe(true);
    });
  });

  describe("Case Study Content Sections & Marketing Layout", () => {
    it("renders all marketing sections (Hero, ClientIntro, EmailNewsletter, DigitalInfographics, RichMedia)", async () => {
      mockAuthData = { authenticated: true };
      const wrapper = await mountSuspended(PrivatePage);

      expect(wrapper.find(".case-study.private").exists()).toBe(true);
      expect(wrapper.findComponent({ name: "SectionsWorkHero" }).exists()).toBe(
        true,
      );
      expect(
        wrapper.findComponent({ name: "SectionsWorkClientIntro" }).exists(),
      ).toBe(true);
      expect(
        wrapper.findComponent({ name: "SectionsWorkEmailNewsletter" }).exists(),
      ).toBe(true);
      expect(
        wrapper
          .findComponent({ name: "SectionsWorkDigitalInfographics" })
          .exists(),
      ).toBe(true);
      expect(
        wrapper.findComponent({ name: "SectionsWorkRichMedia" }).exists(),
      ).toBe(true);
    });

    it("falls back gracefully to draftPrivateCaseStudy when API returns empty or fails", async () => {
      mockAuthData = { authenticated: true };
      mockProjects = [];
      const wrapper = await mountSuspended(PrivatePage);

      const hero = wrapper.findComponent({ name: "SectionsWorkHero" });
      expect(hero.exists()).toBe(true);
      expect(hero.props("project").hero.title).toBe("Private Case Study");
    });

    it("uses WP API project data when slug 'private' is returned by backend", async () => {
      mockAuthData = { authenticated: true };
      mockProjects = [makePrivateProject()];
      const wrapper = await mountSuspended(PrivatePage);

      const hero = wrapper.findComponent({ name: "SectionsWorkHero" });
      expect(hero.exists()).toBe(true);
      expect(hero.props("project").hero.title).toBe(
        "Custom Private Hero Title",
      );
    });
  });

  describe("Work Navigation (Previous and Next projects)", () => {
    it("renders navigation linking to neighbors when published projects exist", async () => {
      mockAuthData = { authenticated: true };
      mockProjects = [
        makeNeighborProject("proj-alpha", 1),
        makePrivateProject(),
        makeNeighborProject("proj-beta", 3),
      ];
      const wrapper = await mountSuspended(PrivatePage);

      const nav = wrapper.find(".work-navigation");
      expect(nav.exists()).toBe(true);
      const prevLink = nav.find("a.previous");
      const nextLink = nav.find("a.next");
      expect(
        prevLink.attributes("href") || prevLink.attributes("to"),
      ).toContain("proj-alpha");
      expect(
        nextLink.attributes("href") || nextLink.attributes("to"),
      ).toContain("proj-beta");
    });

    it("falls back to first and last published projects when private is not in API list", async () => {
      mockAuthData = { authenticated: true };
      mockProjects = [
        makeNeighborProject("first-proj", 1),
        makeNeighborProject("last-proj", 2),
      ];
      const wrapper = await mountSuspended(PrivatePage);

      const nav = wrapper.find(".work-navigation");
      expect(nav.exists()).toBe(true);
      expect(nav.find("a.previous").text()).toContain("Previous Project");
      expect(nav.find("a.next").text()).toContain("Next Project");
    });
  });

  describe("Scrollama and Step Transitions", () => {
    it("handles step enter and step exit callbacks safely", async () => {
      mockAuthData = { authenticated: true };
      const wrapper = await mountSuspended(PrivatePage);

      if (scrollamaState.onStepEnter) {
        const dummyElement = document.createElement("div");
        scrollamaState.onStepEnter({ element: dummyElement, index: 0 });
        expect(dummyElement.classList.contains("animated")).toBe(true);

        scrollamaState.onStepEnter({ element: dummyElement, index: 1 });
        scrollamaState.onStepEnter({ element: dummyElement, index: 2 });
        scrollamaState.onStepEnter({ element: dummyElement, index: 3 });
        scrollamaState.onStepEnter({ element: dummyElement, index: 4 });
      }

      if (scrollamaState.onStepExit) {
        scrollamaState.onStepExit({ index: 0, direction: "down" });
      }

      // Trigger resize
      window.dispatchEvent(new Event("resize"));
      expect(wrapper.exists()).toBe(true);
    });

    it("destroys scrollama on component unmount", async () => {
      mockAuthData = { authenticated: true };
      const dummyStep = document.createElement("div");
      dummyStep.className = "step";
      document.body.appendChild(dummyStep);

      const wrapper = await mountSuspended(PrivatePage);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      wrapper.unmount();
      expect(mockDestroy).toHaveBeenCalled();
      dummyStep.remove();
    });
  });
});
