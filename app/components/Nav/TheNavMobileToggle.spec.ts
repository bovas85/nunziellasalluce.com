import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { useRoute } from "vue-router";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import TheNavMobileToggle from "./TheNavMobileToggle.vue";

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRoute: vi.fn(() => ({
      path: "/",
    })),
  };
});

describe("TheNavMobileToggle", () => {
  beforeEach(() => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/",
    } as RouteLocationNormalizedLoaded);
  });

  it("uses black icon on /, /contact, and /privacy-policy routes", async () => {
    for (const path of ["/", "/contact", "/privacy-policy"]) {
      vi.mocked(useRoute).mockReturnValue({
        path,
      } as RouteLocationNormalizedLoaded);
      const wrapper = await mountSuspended(TheNavMobileToggle, {
        props: { navOpen: false, menuScrolled: false },
      });

      const paths = wrapper.findAll("svg path");
      expect(paths[0]?.attributes("stroke")).toBe("black");
      expect(paths[1]?.attributes("fill")).toBe("black");
    }
  });

  it("uses white icon on /about when not scrolled and switches to black when scrolled", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/about",
    } as RouteLocationNormalizedLoaded);

    const unscrolled = await mountSuspended(TheNavMobileToggle, {
      props: { navOpen: false, menuScrolled: false },
    });
    const unscrolledPaths = unscrolled.findAll("svg path");
    expect(unscrolledPaths[0]?.attributes("stroke")).toBe("white");
    expect(unscrolledPaths[1]?.attributes("fill")).toBe("white");

    const scrolled = await mountSuspended(TheNavMobileToggle, {
      props: { navOpen: false, menuScrolled: true },
    });
    const scrolledPaths = scrolled.findAll("svg path");
    expect(scrolledPaths[0]?.attributes("stroke")).toBe("black");
    expect(scrolledPaths[1]?.attributes("fill")).toBe("black");
  });

  it("renders black close icon when navOpen is true and emits toggle on click", async () => {
    const wrapper = await mountSuspended(TheNavMobileToggle, {
      props: { navOpen: true, menuScrolled: false },
    });

    const closeIcon = wrapper.find(".close-icon");
    expect(closeIcon.exists()).toBe(true);
    expect(closeIcon.classes()).toContain("black");

    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("toggle")).toBeTruthy();
  });
});
