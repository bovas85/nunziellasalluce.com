import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import WorkPage from "./[work].vue";

// Mock vue-router
const mockRoute = {
  params: { work: "project-one" }
};
vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRoute: () => mockRoute,
  };
});

// Mock #app
vi.mock("#app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("#app")>();
  return {
    ...actual,
    useAsyncData: vi.fn().mockReturnValue({
      data: ref([
        {
          slug: "project-one",
          acf: {
            status: "true",
            category: "design",
            hero: {
              title: "Project One Hero",
              desktop_bg: {
                url: "mock-url.jpg",
                sizes: {
                  small: "mock-url.jpg",
                  medium: "mock-url.jpg",
                  large: "mock-url.jpg",
                  ultra: "mock-url.jpg"
                }
              },
              mobile_bg: {
                url: "mock-url.jpg",
                sizes: {
                  small: "mock-url.jpg",
                  medium: "mock-url.jpg",
                  large: "mock-url.jpg",
                  ultra: "mock-url.jpg"
                }
              }
            },
            seo: { description: "SEO description" }
          }
        },
        {
          slug: "project-two",
          acf: {
            status: "true",
            category: "dev",
            hero: {
              title: "Project Two Hero",
              desktop_bg: {
                url: "mock-url2.jpg",
                sizes: {
                  small: "mock-url2.jpg",
                  medium: "mock-url2.jpg",
                  large: "mock-url2.jpg",
                  ultra: "mock-url2.jpg"
                }
              },
              mobile_bg: {
                url: "mock-url2.jpg",
                sizes: {
                  small: "mock-url2.jpg",
                  medium: "mock-url2.jpg",
                  large: "mock-url2.jpg",
                  ultra: "mock-url2.jpg"
                }
              }
            }
          }
        }
      ]),
    }),
  };
});

// Mock scrollama to prevent errors
vi.mock("scrollama", () => {
  return {
    default: () => ({
      setup: vi.fn().mockReturnThis(),
      onStepEnter: vi.fn().mockReturnThis(),
      onStepExit: vi.fn().mockReturnThis(),
      resize: vi.fn(),
      destroy: vi.fn(),
    })
  };
});

describe("Work Page", () => {
  beforeEach(() => {
    mockRoute.params.work = "project-one";
  });

  it("fetches and renders project data correctly", async () => {
    const wrapper = await mountSuspended(WorkPage);

    // Check if the current project hero title is rendered by SectionsWorkHero
    expect(wrapper.text()).toContain("Project One Hero");

    // Should display navigation to next project
    expect(wrapper.text()).toContain("Next Project");
  });

  it("renders UINotFound when project does not exist", async () => {
    mockRoute.params.work = "non-existent-project";
    const wrapper = await mountSuspended(WorkPage);

    // UINotFound is rendered
    expect(wrapper.findComponent({ name: "UINotFound" }).exists()).toBe(true);
  });
});
