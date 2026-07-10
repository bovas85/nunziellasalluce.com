import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import PrivacyPolicy from "./privacy-policy.vue";

describe("PrivacyPolicy Page", () => {
  it("renders privacy policy title and text", async () => {
    const wrapper = await mountSuspended(PrivacyPolicy);
    expect(wrapper.find("h1").text()).toBe("Privacy Policy");
    expect(wrapper.text()).toContain("What personal data we collect");
  });
});
