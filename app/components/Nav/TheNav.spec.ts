import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { nextTick } from "vue";
import TheNav from "./TheNav.vue";

const mockRuntimeConfig = {
  public: {
    enableDesktopBurgerMenu: true,
  },
};

vi.mock("#app", async (importOriginal) => {
  const original = await importOriginal<typeof import("#app")>();
  return {
    ...original,
    useRuntimeConfig: vi.fn(() => mockRuntimeConfig),
  };
});

describe("TheNav", () => {
  beforeEach(() => {
    mockRuntimeConfig.public.enableDesktopBurgerMenu = true;
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

  it("toggles navigation drawer and scroll lock when burger button is clicked", async () => {
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
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");

    await toggle.trigger("click");
    await nextTick();

    expect(toggle.attributes("aria-expanded")).toBe("false");
    expect(wrapper.find(".navigation").classes()).not.toContain("nav-open");
    expect(document.body.style.overflow).toBe("visible");
    expect(document.documentElement.style.overflow).toBe("visible");
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
