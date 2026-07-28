import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import DefaultLayout from "./default.vue";
import CookieBox from "../components/UI/CookieBox.vue";
import TheNav from "../components/Nav/TheNav.vue";
import TheFooter from "../components/Footers/TheFooter.vue";

describe("Default Layout", () => {
  it("renders main components (cookie box, nav, footer)", async () => {
    const wrapper = await mountSuspended(DefaultLayout);
    expect(wrapper.html()).toContain('class="app"');

    // Check for child components using findComponent with actual imported components
    expect(wrapper.findComponent(CookieBox).exists()).toBe(true);
    expect(wrapper.findComponent(TheNav).exists()).toBe(true);
    expect(wrapper.findComponent(TheFooter).exists()).toBe(true);
  });

  it("renders the slot content", async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: {
        default: '<div class="test-slot">Test Content</div>',
      },
    });

    expect(wrapper.html()).toContain('class="test-slot"');
    expect(wrapper.text()).toContain('Test Content');
  });

  it("renders awwwards badge on the home page '/'", async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      route: { path: '/' }
    });
    expect(wrapper.find("#awwwards").exists()).toBe(true);
    expect(wrapper.html()).toContain('href="https://www.awwwards.com/sites/nunziella-salluce-designer"');
  });

  it("does not render awwwards badge on other pages", async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      route: { path: '/about' }
    });
    expect(wrapper.find("#awwwards").exists()).toBe(false);
  });
});
