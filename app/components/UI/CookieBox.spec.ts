import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import CookieBox from "./CookieBox.vue";

describe("CookieBox", () => {
  const mountOptions = {
    global: {
      stubs: {
        NuxtLink: true,
      },
    },
  };

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it("does not show the cookie banner if already accepted", () => {
    localStorage.setItem("NuniCookie", "true");
    const wrapper = mount(CookieBox, mountOptions);

    vi.runAllTimers();

    const vm = wrapper.vm as unknown as { hide: boolean; show: boolean };
    expect(vm.hide).toBe(true);
    expect(vm.show).toBe(false);
  });

  it("shows the cookie banner after 4 seconds if not accepted", async () => {
    const wrapper = mount(CookieBox, mountOptions);

    const vm1 = wrapper.vm as unknown as { hide: boolean; show: boolean };
    expect(vm1.hide).toBe(true);

    vi.advanceTimersByTime(4000);
    await wrapper.vm.$nextTick();

    const vm2 = wrapper.vm as unknown as { hide: boolean; show: boolean };
    expect(vm2.hide).toBe(false);
    expect(vm2.show).toBe(true);
  });

  it("saves consent and hides the banner when Close is clicked", async () => {
    const wrapper = mount(CookieBox, mountOptions);

    vi.advanceTimersByTime(4000);
    await wrapper.vm.$nextTick();

    const closeBtn = wrapper.find(".privacy-link");
    expect(closeBtn.exists()).toBe(true);

    await closeBtn.trigger("click");

    const vm = wrapper.vm as unknown as { hide: boolean; show: boolean };
    expect(vm.hide).toBe(true);
    expect(vm.show).toBe(false);
    expect(localStorage.getItem("NuniCookie")).toBe("true");
  });
});
