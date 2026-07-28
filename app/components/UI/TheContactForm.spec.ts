import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import TheContactForm from "./TheContactForm.vue";

const mockIsOnline = ref(true);

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
    global: {
      stubs: {
        NuxtLink: true,
        RouterLink: true,
      },
    },
  };

  const mockFetch = vi.fn();

  beforeEach(() => {
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
    const errorMsg = wrapper.find(".send-error");
    expect(errorMsg.exists()).toBe(true);
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

  it("handles API failure during submission", async () => {
    mockFetch.mockRejectedValueOnce(new Error("API Error"));
    const wrapper = mount(TheContactForm, mountOptions);

    await wrapper.find('input[id="name"]').setValue("Jane Doe");
    await wrapper.find('input[id="email"]').setValue("jane@example.com");
    await wrapper.find("textarea").setValue("Hello online");
    await wrapper.find('input[id="check1"]').setValue(true);

    const submitBtn = wrapper.find("button.button--contact");
    await submitBtn.trigger("click");

    await vi.runAllTimersAsync();

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Check if error message is displayed
    const errorMsg = wrapper.findAll('.send-error').find(el => el.text().includes('error sending the form'));
    expect(errorMsg?.isVisible()).toBe(true);

    // Also check if 'sending' and 'disabled' state was reset
    expect(submitBtn.classes()).not.toContain("is-disabled");
    expect(submitBtn.attributes("disabled")).toBeUndefined();
  });

  it("handles invalid stored data gracefully without crashing", () => {
    localStorage.setItem("contactFormData", "invalid data {");
    const wrapper = mount(TheContactForm, mountOptions);
    expect(wrapper.exists()).toBe(true);
  });
});
