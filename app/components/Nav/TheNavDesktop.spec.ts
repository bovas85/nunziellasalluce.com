import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRoute } from "vue-router";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import TheNavDesktop from "./TheNavDesktop.vue";

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRoute: vi.fn(() => ({
      path: "/",
      hash: "",
    })),
  };
});

describe("TheNavDesktop", () => {
  beforeEach(() => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/",
      hash: "",
    } as RouteLocationNormalizedLoaded);
    vi.clearAllMocks();
  });

  it("smoothly scrolls to #work when clicking Work on the home page", async () => {
    const scrollIntoView = vi.fn();
    const workEl = document.createElement("section");
    workEl.id = "work";
    workEl.scrollIntoView = scrollIntoView;
    document.body.appendChild(workEl);

    try {
      const wrapper = await mountSuspended(TheNavDesktop);
      const workLink = wrapper.findAll("a").find((l) => l.text() === "Work");
      expect(workLink).toBeTruthy();

      await workLink!.trigger("click");
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    } finally {
      workEl.remove();
    }
  });

  it("prevents redundant navigation and re-scrolls to #work when already at /#work", async () => {
    vi.mocked(useRoute).mockReturnValue({
      path: "/",
      hash: "#work",
    } as RouteLocationNormalizedLoaded);

    const scrollIntoView = vi.fn();
    const workEl = document.createElement("section");
    workEl.id = "work";
    workEl.scrollIntoView = scrollIntoView;
    document.body.appendChild(workEl);

    try {
      const wrapper = await mountSuspended(TheNavDesktop);
      const workLink = wrapper.findAll("a").find((l) => l.text() === "Work");
      expect(workLink?.classes()).toContain("nuxt-link-active");

      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      workLink!.element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    } finally {
      workEl.remove();
    }
  });
});
