import { describe, it, expect, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import TheMenuMobile from "./TheMenuMobile.vue";
import { useRoute } from "vue-router";
import type { RouteLocationNormalizedLoaded } from "vue-router";

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRoute: vi.fn(() => ({
      path: "/",
    })),
  };
});

describe("TheMenuMobile", () => {
  it("renders overlay and right-nav with is-visible class when navOpen is true", async () => {
    const wrapper = await mountSuspended(TheMenuMobile, {
      props: {
        menuItems: [],
        navOpen: true,
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    expect(wrapper.find(".overlay").classes()).toContain("is-visible");
    expect(wrapper.find(".right-nav").classes()).toContain("is-visible");
  });

  it("does not render is-visible class when navOpen is false", async () => {
    const wrapper = await mountSuspended(TheMenuMobile, {
      props: {
        menuItems: [],
        navOpen: false,
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    expect(wrapper.find(".overlay").classes()).not.toContain("is-visible");
    expect(wrapper.find(".right-nav").classes()).not.toContain("is-visible");
  });

  it("emits close event when overlay is clicked", async () => {
    const wrapper = await mountSuspended(TheMenuMobile, {
      props: {
        menuItems: [],
        navOpen: true,
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    await wrapper.find(".overlay").trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("renders empty string menu item as 'Home' and correctly sets to prop", async () => {
    const wrapper = await mountSuspended(TheMenuMobile, {
      props: {
        menuItems: [""],
        navOpen: true,
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const link = wrapper.findComponent({ name: "NuxtLink" });
    expect(link.text()).toBe("Home");
    expect(link.props("to")).toBe("/");
  });

  it("renders normal menu items and emits close on click", async () => {
    const wrapper = await mountSuspended(TheMenuMobile, {
      props: {
        menuItems: ["about"],
        navOpen: true,
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const link = wrapper.findComponent({ name: "NuxtLink" });
    expect(link.text()).toBe("about");
    expect(link.props("to")).toBe("/about");

    await link.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("renders 'work' as a regular anchor tag with href='#work' on the home page", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/",
    } as RouteLocationNormalizedLoaded);
    const wrapper = await mountSuspended(TheMenuMobile, {
      props: {
        menuItems: ["work"],
        navOpen: true,
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const links = wrapper.findAll("a");
    const workLink = links.find((l) => l.text() === "Work");

    expect(workLink).toBeDefined();
    expect(workLink?.attributes("href")).toBe("#work");

    await workLink?.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("renders 'work' as NuxtLink to '/#work' when not on home page", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/about",
    } as RouteLocationNormalizedLoaded);
    const wrapper = await mountSuspended(TheMenuMobile, {
      props: {
        menuItems: ["work"],
        navOpen: true,
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const link = wrapper.findComponent({ name: "NuxtLink" });
    expect(link.text()).toBe("Work");
    expect(link.props("to")).toBe("/#work");

    await link.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });
});
