import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import SlugCatchAll from "./[...slug].vue";

describe("SlugCatchAll Page", () => {
  it("renders the NotFound component", async () => {
    const wrapper = await mountSuspended(SlugCatchAll);
    expect(wrapper.find(".page-not-found").exists()).toBe(true);
    expect(wrapper.text()).toContain("HOME");
  });
});
