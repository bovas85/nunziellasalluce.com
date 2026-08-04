import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import TheNavDesktop from "./TheNavDesktop.vue";
import { useRoute } from "vue-router";
import type { RouteLocationNormalizedLoaded } from "vue-router";

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRoute: vi.fn(),
  };
});

describe("TheNavDesktop", () => {
  beforeEach(() => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/",
      hash: "",
    } as RouteLocationNormalizedLoaded);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("applies 'black' class when route.path is '/'", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/",
      hash: "",
    } as RouteLocationNormalizedLoaded);

    const wrapper = await mountSuspended(TheNavDesktop);
    expect(wrapper.find("ul.menu").classes()).toContain("black");
  });

  it("applies 'black' class when route.path is '/contact'", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/contact",
      hash: "",
    } as RouteLocationNormalizedLoaded);

    const wrapper = await mountSuspended(TheNavDesktop);
    expect(wrapper.find("ul.menu").classes()).toContain("black");
  });

  it("applies 'black' class when route.path is '/privacy-policy'", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/privacy-policy",
      hash: "",
    } as RouteLocationNormalizedLoaded);

    const wrapper = await mountSuspended(TheNavDesktop);
    expect(wrapper.find("ul.menu").classes()).toContain("black");
  });

  it("does not apply 'black' class when route.path is '/about'", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/about",
      hash: "",
    } as RouteLocationNormalizedLoaded);

    const wrapper = await mountSuspended(TheNavDesktop);
    expect(wrapper.find("ul.menu").classes()).not.toContain("black");
  });

  it("applies 'nuxt-link-active' to Home link when path is '/' and hash is not '#work'", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/",
      hash: "",
    } as RouteLocationNormalizedLoaded);

    const wrapper = await mountSuspended(TheNavDesktop);

    // Find NuxtLink by text using root wrapper search
    const links = wrapper.findAllComponents({ name: 'NuxtLink' });
    const homeLink = links.find(l => l.text() === 'Home');
    expect(homeLink).toBeDefined();

    // NuxtLink renders as 'a' in tests when mountSuspended is used
    expect(homeLink!.classes()).toContain("nuxt-link-active");
  });

  it("does not apply 'nuxt-link-active' to Home link when path is '/' but hash is '#work'", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/",
      hash: "#work",
    } as RouteLocationNormalizedLoaded);

    const wrapper = await mountSuspended(TheNavDesktop);

    const links = wrapper.findAllComponents({ name: 'NuxtLink' });
    const homeLink = links.find(l => l.text() === 'Home');
    expect(homeLink).toBeDefined();

    expect(homeLink!.classes()).not.toContain("nuxt-link-active");
  });

  it("applies 'nuxt-link-active' to Work link when hash is '#work'", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/",
      hash: "#work",
    } as RouteLocationNormalizedLoaded);

    const wrapper = await mountSuspended(TheNavDesktop);

    const links = wrapper.findAllComponents({ name: 'NuxtLink' });
    const workLink = links.find(l => l.text() === 'Work');
    expect(workLink).toBeDefined();

    expect(workLink!.classes()).toContain("nuxt-link-active");
  });
});
