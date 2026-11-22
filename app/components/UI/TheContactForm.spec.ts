import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import TheContactForm from "./TheContactForm.vue";

const mockIsOnline = ref(true);

const mockRuntimeConfig = {
  public: {
    enableNormalizeContactFormButton: true,
  },
};

vi.mock("#app", async (importOriginal) => {
  const original = await importOriginal<typeof import("#app")>();
  return {
    ...original,
    useRuntimeConfig: vi.fn(() => mockRuntimeConfig),
  };
});

vi.mock("@vueuse/core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@vueuse/core")>();
  return {
    ...original,
    useNetwork: () => ({
      isOnline: mockIsOnline,
    }),
  };
});

describe("TheContactForm", () => {
  const mountOptions = {
    attachTo: document.body,
    global: {
      stubs: {
        NuxtLink: true,
        RouterLink: true,
      },
    },
  };

  const mockFetch = vi.fn();

  beforeEach(() => {
    document.body.innerHTML = "";
    mockRuntimeConfig.public.enableNormalizeContactFormButton = true;
    mockIsOnline.value = true;
    localStorage.clear();
    vi.useFakeTimers();
    vi.stubGlobal("$fetch", mockFetch);
    mockFetch.mockReset();
  });

  it("renders input fields and submit button", () => {
    const wrapper = mount(TheContactForm, mountOptions);
    expect(wrapper.find('input[id="name"]').exists()).toBe(true);
    expect(wrapper.find('input[id="email"]').exists()).toBe(true);
    expect(wrapper.find("textarea").exists()).toBe(true);
    expect(wrapper.find("button.button--contact").exists()).toBe(true);
  });

  it("initially hides the validation error message", () => {
    const wrapper = mount(TheContactForm, mountOptions);
    const errorMsgs = wrapper.findAll(".send-error");
    expect(errorMsgs.length).toBeGreaterThan(0);
    for (const msg of errorMsgs) {
      expect(msg.isVisible()).toBe(false);
    }
  });

  it("shows name and email field validation errors on blur", async () => {
    const wrapper = mount(TheContactForm, mountOptions);

    const nameInput = wrapper.find('input[id="name"]');
    const emailInput = wrapper.find('input[id="email"]');

    await nameInput.trigger("blur");
    expect(nameInput.classes()).toContain("is-danger");

    await emailInput.setValue("invalid-email");
    await emailInput.trigger("blur");
    expect(emailInput.classes()).toContain("is-danger");

    await emailInput.setValue("test@example.com");
    await emailInput.trigger("blur");
    expect(emailInput.classes()).not.toContain("is-danger");
  });

  it("does not submit if honeypot is filled", async () => {
    const wrapper = mount(TheContactForm, mountOptions);

    await wrapper.find('input[id="name"]').setValue("John Doe");
    await wrapper.find('input[id="email"]').setValue("john@example.com");
    await wrapper.find("textarea").setValue("Hello world");
    await wrapper.find('input[id="check1"]').setValue(true);

    const honeypot = wrapper.find(".honeypot");
    expect(honeypot.exists()).toBe(true);
    await honeypot.setValue("spam-bot");

    const submitBtn = wrapper.find("button.button--contact");
    await submitBtn.trigger("click");

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("saves form data locally when offline", async () => {
    mockIsOnline.value = false;
    const wrapper = mount(TheContactForm, mountOptions);

    await wrapper.find('input[id="name"]').setValue("John Doe");
    await wrapper.find('input[id="email"]').setValue("john@example.com");
    await wrapper.find("textarea").setValue("Hello offline");
    await wrapper.find('input[id="check1"]').setValue(true);

    const submitBtn = wrapper.find("button.button--contact");
    await submitBtn.trigger("click");

    expect(mockFetch).not.toHaveBeenCalled();
    const stored = localStorage.getItem("contactFormData");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toMatchObject({
      yourName: "John Doe",
      yourEmail: "john@example.com",
      yourMessage: "Hello offline",
      youAgree: true,
    });
  });

  it("makes API post request on successful valid submission", async () => {
    mockFetch.mockResolvedValueOnce({ status: "mail_sent" });
    const wrapper = mount(TheContactForm, mountOptions);

    await wrapper.find('input[id="name"]').setValue("Jane Doe");
    await wrapper.find('input[id="email"]').setValue("jane@example.com");
    await wrapper.find("textarea").setValue("Hello online");
    await wrapper.find('input[id="check1"]').setValue(true);

    const submitBtn = wrapper.find("button.button--contact");
    await submitBtn.trigger("click");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const fetchArgs = mockFetch.mock.calls[0];
    expect(fetchArgs[0]).toContain(
      "/wp-json/contact-form-7/v1/contact-forms/78/feedback",
    );
  });

  it("handles API failure during submission and reports alert", async () => {
    mockFetch
      .mockRejectedValueOnce(new Error("API Error"))
      .mockResolvedValueOnce({ ok: true });
    const wrapper = mount(TheContactForm, mountOptions);

    await wrapper.find('input[id="name"]').setValue("Jane Doe");
    await wrapper.find('input[id="email"]').setValue("jane@example.com");
    await wrapper.find("textarea").setValue("Hello online");
    await wrapper.find('input[id="check1"]').setValue(true);

    const submitBtn = wrapper.find("button.button--contact");
    await submitBtn.trigger("click");

    await vi.runAllTimersAsync();

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][0]).toBe("/api/contact-alert");
    expect(mockFetch.mock.calls[1][1]).toMatchObject({
      method: "POST",
      body: {
        kind: "error",
        cf7Status: "network_or_http_error",
      },
    });

    // Check if error message is displayed
    const errorMsg = wrapper
      .findAll(".send-error")
      .find((el) => el.text().includes("error sending the form"));
    expect(errorMsg).toBeDefined();
    expect(errorMsg!.isVisible()).toBe(true);

    // Also check if 'sending' and 'disabled' state was reset
    expect(submitBtn.classes()).not.toContain("is-disabled");
    expect(submitBtn.attributes("disabled")).toBeUndefined();
  });

  it("reports CF7 spam/mail_failed responses to /api/contact-alert without PII", async () => {
    mockFetch
      .mockResolvedValueOnce({
        status: "spam",
        message: "There was an error trying to send your message.",
      })
      .mockResolvedValueOnce({ ok: true });
    const wrapper = mount(TheContactForm, mountOptions);

    await wrapper.find('input[id="name"]').setValue("Jane Doe");
    await wrapper.find('input[id="email"]').setValue("jane@example.com");
    await wrapper.find("textarea").setValue("Secret message");
    await wrapper.find('input[id="check1"]').setValue(true);

    await wrapper.find("button.button--contact").trigger("click");
    await vi.runAllTimersAsync();

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][0]).toBe("/api/contact-alert");
    const alertPayload = JSON.stringify(mockFetch.mock.calls[1][1]);
    expect(alertPayload).toContain("spam");
    expect(alertPayload).not.toContain("Jane Doe");
    expect(alertPayload).not.toContain("jane@example.com");
    expect(alertPayload).not.toContain("Secret message");
  });

  it("handles invalid stored data gracefully without crashing", () => {
    localStorage.setItem("contactFormData", "invalid data {");
    const wrapper = mount(TheContactForm, mountOptions);
    expect(wrapper.exists()).toBe(true);
  });

  it("applies is-normalized class to submit button when enableNormalizeContactFormButton is true", () => {
    mockRuntimeConfig.public.enableNormalizeContactFormButton = true;
    const wrapper = mount(TheContactForm, mountOptions);
    const submitBtn = wrapper.find("button.button--contact");
    expect(submitBtn.classes()).toContain("is-normalized");
  });

  it("omits is-normalized class from submit button when enableNormalizeContactFormButton is false", () => {
    mockRuntimeConfig.public.enableNormalizeContactFormButton = false;
    const wrapper = mount(TheContactForm, mountOptions);
    const submitBtn = wrapper.find("button.button--contact");
    expect(submitBtn.classes()).not.toContain("is-normalized");
  });

  it("allows submitting a restored localStorage draft when online and clears it on success", async () => {
    localStorage.setItem(
      "contactFormData",
      JSON.stringify({
        yourName: "Saved User",
        yourEmail: "saved@example.com",
        yourMessage: "Offline draft",
        youAgree: true,
      }),
    );
    mockFetch.mockResolvedValueOnce({ status: "mail_sent" });

    const wrapper = mount(TheContactForm, mountOptions);
    await wrapper.vm.$nextTick();

    const submitBtn = wrapper.find("button.button--contact");
    expect(submitBtn.attributes("disabled")).toBeUndefined();
    expect(submitBtn.classes()).not.toContain("is-disabled");

    await submitBtn.trigger("click");
    await vi.runAllTimersAsync();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(wrapper.find(".sent").classes()).toContain("is-visible");
    expect(localStorage.getItem("contactFormData")).toBeNull();
  });

  it("shows send error and alerts when Contact Form 7 returns mail_failed", async () => {
    mockFetch
      .mockResolvedValueOnce({ status: "mail_failed" })
      .mockResolvedValueOnce({ ok: true });
    const wrapper = mount(TheContactForm, mountOptions);

    await wrapper.find('input[id="name"]').setValue("Jane Doe");
    await wrapper.find('input[id="email"]').setValue("jane@example.com");
    await wrapper.find("textarea").setValue("Hello online");
    await wrapper.find('input[id="check1"]').setValue(true);

    const submitBtn = wrapper.find("button.button--contact");
    await submitBtn.trigger("click");
    await vi.runAllTimersAsync();

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][0]).toBe("/api/contact-alert");

    const errorMsg = wrapper
      .findAll(".send-error")
      .find((el) => el.text().includes("error sending the form"));
    expect(errorMsg).toBeDefined();
    expect(errorMsg!.isVisible()).toBe(true);
    expect(wrapper.find(".sent").classes()).not.toContain("is-visible");
  });

  it("suppresses /api/contact-alert when Contact Form 7 returns validation_failed", async () => {
    mockFetch.mockResolvedValueOnce({ status: "validation_failed" });
    const wrapper = mount(TheContactForm, mountOptions);

    await wrapper.find('input[id="name"]').setValue("Jane Doe");
    await wrapper.find('input[id="email"]').setValue("jane@example.com");
    await wrapper.find("textarea").setValue("Hello online");
    await wrapper.find('input[id="check1"]').setValue(true);

    await wrapper.find("button.button--contact").trigger("click");
    await vi.runAllTimersAsync();

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("reports a latency spike alert when mail_sent exceeds 5000ms", async () => {
    vi.setSystemTime(1000);
    mockFetch
      .mockImplementationOnce(async () => {
        vi.setSystemTime(6500);
        return { status: "mail_sent" };
      })
      .mockResolvedValueOnce({ ok: true });
    const wrapper = mount(TheContactForm, mountOptions);

    await wrapper.find('input[id="name"]').setValue("Jane Doe");
    await wrapper.find('input[id="email"]').setValue("jane@example.com");
    await wrapper.find("textarea").setValue("Hello slow");
    await wrapper.find('input[id="check1"]').setValue(true);

    await wrapper.find("button.button--contact").trigger("click");
    await vi.runAllTimersAsync();

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][0]).toBe("/api/contact-alert");
    expect(mockFetch.mock.calls[1][1]).toMatchObject({
      method: "POST",
      body: {
        kind: "latency",
        cf7Status: "mail_sent",
        latencyMs: 5500,
      },
    });
  });

  it("marks required fields invalid when submitting an empty form", async () => {
    const wrapper = mount(TheContactForm, mountOptions);

    await wrapper.find("button.button--contact").trigger("click");

    expect(wrapper.find('input[id="name"]').classes()).toContain("is-danger");
    expect(wrapper.find('input[id="email"]').classes()).toContain("is-danger");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
