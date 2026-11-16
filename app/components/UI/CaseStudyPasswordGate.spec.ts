import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import CaseStudyPasswordGate from "./CaseStudyPasswordGate.vue";

describe("CaseStudyPasswordGate.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders gate card, title, input, and unlock button", async () => {
    const wrapper = await mountSuspended(CaseStudyPasswordGate, {
      props: {
        projectTitle: "confidential-client-project",
      },
    });

    expect(wrapper.find("[data-testid='password-gate']").exists()).toBe(true);
    expect(wrapper.find("h1.title").text()).toBe("Confidential Client Project");
    expect(wrapper.text()).toContain("Protected Work");
    expect(wrapper.find("label[for='case-study-password']").exists()).toBe(
      true,
    );
    const input = wrapper.find("input#case-study-password");
    expect(input.exists()).toBe(true);
    expect(input.attributes("type")).toBe("password");
    expect(input.attributes("autocomplete")).toBe("current-password");
    expect(wrapper.find("button.button-unlock").text()).toBe(
      "Unlock Case Study",
    );
  });

  it("submits password to /api/verify-access and emits unlocked on success", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ success: true });
    vi.stubGlobal("$fetch", fetchSpy);

    const wrapper = await mountSuspended(CaseStudyPasswordGate, {
      props: {
        projectTitle: "samsung-confidential",
      },
    });

    const input = wrapper.find("input#case-study-password");
    await input.setValue("valid-secret-password");
    await wrapper.find("form").trigger("submit");

    expect(fetchSpy).toHaveBeenCalledWith("/api/verify-access", {
      method: "POST",
      body: { password: "valid-secret-password" },
    });

    expect(wrapper.emitted("unlocked")).toBeTruthy();
    expect(wrapper.emitted("unlocked")?.length).toBe(1);
    vi.unstubAllGlobals();
  });

  it("displays error message when /api/verify-access returns incorrect password", async () => {
    const fetchSpy = vi.fn().mockRejectedValue({
      data: { error: "Incorrect password" },
    });
    vi.stubGlobal("$fetch", fetchSpy);

    const wrapper = await mountSuspended(CaseStudyPasswordGate);

    const input = wrapper.find("input#case-study-password");
    await input.setValue("wrong-pass");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.emitted("unlocked")).toBeFalsy();
    const errorEl = wrapper.find("#gate-error-message");
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.text()).toBe("Incorrect password");
    expect(errorEl.attributes("role")).toBe("alert");
    vi.unstubAllGlobals();
  });

  it("does not call API if password is empty", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("$fetch", fetchSpy);

    const wrapper = await mountSuspended(CaseStudyPasswordGate);
    await wrapper.find("form").trigger("submit");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(wrapper.emitted("unlocked")).toBeFalsy();
    vi.unstubAllGlobals();
  });
});
