import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import LazyImage from "./app/components/UI/LazyImage.vue";

describe("LazyImage Benchmark", () => {
  it("measures time to mount multiple instances", async () => {
    const spy = vi.spyOn(document, 'querySelectorAll');

    for (let i = 0; i < 100; i++) {
      mount(LazyImage, {
        props: {
          videoMobile: "mobile.mp4",
          videoDesktop: "desktop.mp4",
          lazyload: true
        }
      });
    }

    console.log("querySelectorAll called:", spy.mock.calls.length, "times");
    expect(spy).not.toHaveBeenCalled();
  });
});
