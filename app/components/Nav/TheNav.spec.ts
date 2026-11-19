import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { nextTick, reactive } from "vue";
import TheNav from "./TheNav.vue";

const mockRuntimeConfig = {
  public: {
    enableDesktopBurgerMenu: true,
  },
};

const mockRoute = reactive({
  path: "/",
  hash: "",
});

vi.mock("#app", async (importOriginal) => {
  const original = await importOriginal<typeof import("#app")>();
  return {
    ...original,
    useRuntimeConfig: vi.fn(() => mockRuntimeConfig),
  };
});

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRoute: vi.fn(() => mockRoute),
  };
});

describe("TheNav", () => {
  beforeEach(() => {
    mockRuntimeConfig.public.enableDesktopBurgerMenu = true;
    mockRoute.path = "/";
    mockRoute.hash = "";
    useState("navOpen", () => false).value = false;
    useState("menuScrolled", () => false).value = false;
    useState("menuScrolledDone", () => false).value = false;
    document.body.style.overflow = "visible";
    document.documentElement.style.overflow = "visible";
  });

  it("renders desktop burger toggle and omits horizontal desktop menu when enableDesktopBurgerMenu is true", async () => {
    const wrapper = await mountSuspended(TheNav, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const toggle = wrapper.find(".nav-mobile-toggle");
    expect(toggle.exists()).toBe(true);
    expect(toggle.classes()).toContain("is-desktop-enabled");
    expect(toggle.attributes("aria-expanded")).toBe("false");

    expect(wrapper.find(".nav-desktop").exists()).toBe(false);

    const modalContainer = wrapper.find(".modal-container");
    expect(modalContainer.exists()).toBe(true);
    expect(modalContainer.classes()).not.toContain("is-hidden-desktop");
  });

  it("toggles navigation drawer, scroll lock, and close event when burger button is clicked", async () => {
    const wrapper = await mountSuspended(TheNav, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const toggle = wrapper.find(".nav-mobile-toggle");
    await toggle.trigger("click");
    await nextTick();

    expect(toggle.attributes("aria-expanded")).toBe("true");
    expect(wrapper.find(".navigation").classes()).toContain("nav-open");
    expect(wrapper.find(".right-nav").classes()).toContain("is-visible");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");

    await wrapper.find(".overlay").trigger("click");
    await nextTick();

    expect(toggle.attributes("aria-expanded")).toBe("false");
    expect(wrapper.find(".navigation").classes()).not.toContain("nav-open");
    expect(wrapper.find(".right-nav").classes()).not.toContain("is-visible");
    expect(document.body.style.overflow).toBe("visible");
    expect(document.documentElement.style.overflow).toBe("visible");
  });

  it("resets open drawer and scroll state when route changes", async () => {
    const wrapper = await mountSuspended(TheNav, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    await wrapper.find(".nav-mobile-toggle").trigger("click");
    await nextTick();
    expect(wrapper.find(".navigation").classes()).toContain("nav-open");

    useState("menuScrolled").value = true;
    mockRoute.path = "/about";
    await nextTick();

    expect(wrapper.find(".navigation").classes()).not.toContain("nav-open");
    expect(useState("menuScrolled").value).toBe(false);
    expect(document.body.style.overflow).toBe("visible");
  });

  it("falls back to horizontal desktop menu when enableDesktopBurgerMenu is false", async () => {
    mockRuntimeConfig.public.enableDesktopBurgerMenu = false;

    const wrapper = await mountSuspended(TheNav, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    });

    const toggle = wrapper.find(".nav-mobile-toggle");
    expect(toggle.exists()).toBe(true);
    expect(toggle.classes()).not.toContain("is-desktop-enabled");

    expect(wrapper.find(".nav-desktop").exists()).toBe(true);

    const modalContainer = wrapper.find(".modal-container");
    expect(modalContainer.exists()).toBe(true);
    expect(modalContainer.classes()).toContain("is-hidden-desktop");
  });
});
