import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import App from "./app.vue";

describe("app.vue", () => {
  it("renders the app shell correctly", async () => {
    const wrapper = await mountSuspended(App);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.element.tagName.toLowerCase()).toBe("div");
  });
});
