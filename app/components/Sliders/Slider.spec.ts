import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import Slider from "./Slider.vue";
import { Swiper } from "swiper/vue";
import type { SliderItem, WPImage } from "~/types/acf";

describe("Slider", () => {
  const mockImage = {
    id: 1,
    url: "https://example.com/slide.jpg",
    sizes: {
      small: "https://example.com/slide-small.jpg",
      medium: "https://example.com/slide-medium.jpg",
      large: "https://example.com/slide-large.jpg",
      ultra: "https://example.com/slide-ultra.jpg",
      "4k": "https://example.com/slide-4k.jpg",
    },
  } as unknown as WPImage;

  const mockData: SliderItem[] = [{ image: mockImage }, { image: mockImage }];

  const mountOptions = {
    props: {
      data: mockData,
    },
    global: {
      stubs: {
        Swiper: true,
        SwiperSlide: true,
        UILazyImage: true,
      },
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the Swiper and SwiperSlide elements", () => {
    const wrapper = mount(Slider, mountOptions);
    expect(wrapper.findComponent(Swiper).exists()).toBe(true);
  });

  it("triggers lazySizes.loader.checkElems on slideChange event", async () => {
    const mockCheckElems = vi.fn();
    const globalObj = globalThis as unknown as {
      lazySizes?: {
        loader: {
          checkElems: () => void;
        };
      };
    };
    globalObj.lazySizes = {
      loader: {
        checkElems: mockCheckElems,
      },
    };

    const wrapper = mount(Slider, mountOptions);
    const swiper = wrapper.findComponent(Swiper);
    expect(swiper.exists()).toBe(true);

    await swiper.vm.$emit("slideChange");

    expect(mockCheckElems).toHaveBeenCalled();
    delete globalObj.lazySizes;
  });
});
