import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import TheCarousel from "./TheCarousel.vue";
import { Swiper } from "swiper/vue";
import type { Project, WPImage } from "~/types/acf";

const mockPush = vi.fn();
vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      afterEach: vi.fn(),
    }),
  };
});

const mockRuntimeConfig = {
  public: {
    enableCarouselSwipeFix: true,
  },
};

vi.mock("#app", async (importOriginal) => {
  const original = await importOriginal<typeof import("#app")>();
  return {
    ...original,
    useRuntimeConfig: vi.fn(() => mockRuntimeConfig),
  };
});

describe("TheCarousel", () => {
  const mockImage = {
    id: 1,
    url: "https://example.com/carousel.jpg",
    sizes: {
      small: "https://example.com/carousel-small.jpg",
      medium: "https://example.com/carousel-medium.jpg",
      large: "https://example.com/carousel-large.jpg",
      ultra: "https://example.com/carousel-ultra.jpg",
      "4k": "https://example.com/carousel-4k.jpg",
    },
  } as unknown as WPImage;

  const mockData: Project[] = [
    {
      id: 1,
      slug: "project-1",
      acf: {
        category: "Web Design",
        hero: {
          title: "Project One",
          desktop_bg: mockImage,
          mobile_bg: mockImage,
        },
        product: {},
      },
    } as unknown as Project,
  ];

  const mountOptions = {
    props: {
      data: mockData,
    },
    global: {
      stubs: {
        Swiper: { template: '<div class="swiper-stub"><slot /></div>' },
        SwiperSlide: {
          template: '<div class="swiper-slide-stub"><slot /></div>',
        },
        UILazyImage: {
          template: '<div class="lazy-image-stub"><slot /></div>',
        },
      },
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    mockRuntimeConfig.public.enableCarouselSwipeFix = true;
  });

  it("renders the Swiper and SwiperSlide elements", () => {
    const wrapper = mount(TheCarousel, mountOptions);
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

    const wrapper = mount(TheCarousel, mountOptions);
    const swiper = wrapper.findComponent(Swiper);
    expect(swiper.exists()).toBe(true);

    const dummySwiper = {
      isBeginning: false,
      isEnd: false,
      activeIndex: 1,
    };
    await swiper.vm.$emit("slideChange", dummySwiper);

    expect(mockCheckElems).toHaveBeenCalled();
    delete globalObj.lazySizes;
  });

  it("handles slidePrev and slideNext button clicks", async () => {
    const mockSlidePrev = vi.fn();
    const mockSlideNext = vi.fn();
    const mockSwiper = {
      slidePrev: mockSlidePrev,
      slideNext: mockSlideNext,
      isBeginning: false,
      isEnd: false,
      params: { navigation: {} },
      navigation: { init: vi.fn(), update: vi.fn() },
    };

    const wrapper = mount(TheCarousel, mountOptions);
    const swiper = wrapper.findComponent(Swiper);
    await swiper.vm.$emit("swiper", mockSwiper);

    const prevButton = wrapper.find("button.prev");
    const nextButton = wrapper.find("button.next");

    expect(prevButton.exists()).toBe(true);
    expect(nextButton.exists()).toBe(true);

    await prevButton.trigger("click");
    expect(mockSlidePrev).toHaveBeenCalled();

    await nextButton.trigger("click");
    expect(mockSlideNext).toHaveBeenCalled();
  });

  it("navigates to project page with leading slash when slide or button is clicked", async () => {
    const wrapper = mount(TheCarousel, mountOptions);

    const slideContent = wrapper.find(".slide-content");
    expect(slideContent.exists()).toBe(true);
    await slideContent.trigger("click");
    expect(mockPush).toHaveBeenCalledWith("/project-1");

    const button = wrapper.find("button.subtitle--show");
    expect(button.exists()).toBe(true);
    await button.trigger("click");
    expect(mockPush).toHaveBeenCalledWith("/project-1");
  });

  describe("enableCarouselSwipeFix feature flag", () => {
    it("applies has-swipe-fix class when enableCarouselSwipeFix is true", () => {
      mockRuntimeConfig.public.enableCarouselSwipeFix = true;
      const wrapper = mount(TheCarousel, mountOptions);
      const container = wrapper.find(".swiper-container");
      expect(container.classes()).toContain("has-swipe-fix");
    });

    it("omits has-swipe-fix and is-swiping classes when enableCarouselSwipeFix is false", async () => {
      mockRuntimeConfig.public.enableCarouselSwipeFix = false;
      const wrapper = mount(TheCarousel, mountOptions);
      const container = wrapper.find(".swiper-container");
      expect(container.classes()).not.toContain("has-swipe-fix");

      const swiper = wrapper.findComponent(Swiper);
      await swiper.vm.$emit("sliderMove");
      expect(container.classes()).not.toContain("is-swiping");
    });

    it("toggles is-swiping class during sliderMove and transitionEnd when enabled", async () => {
      mockRuntimeConfig.public.enableCarouselSwipeFix = true;
      const wrapper = mount(TheCarousel, mountOptions);
      const container = wrapper.find(".swiper-container");
      const swiper = wrapper.findComponent(Swiper);

      expect(container.classes()).not.toContain("is-swiping");

      await swiper.vm.$emit("sliderMove");
      expect(container.classes()).toContain("is-swiping");

      await swiper.vm.$emit("transitionEnd");
      expect(container.classes()).not.toContain("is-swiping");
    });

    it("keeps is-swiping on touchEnd when swiper is animating, and removes on transitionEnd", async () => {
      mockRuntimeConfig.public.enableCarouselSwipeFix = true;
      const wrapper = mount(TheCarousel, mountOptions);
      const container = wrapper.find(".swiper-container");
      const swiper = wrapper.findComponent(Swiper);

      await swiper.vm.$emit("sliderMove");
      expect(container.classes()).toContain("is-swiping");

      // swiper animating is true
      await swiper.vm.$emit("touchEnd", { animating: true });
      expect(container.classes()).toContain("is-swiping");

      await swiper.vm.$emit("transitionEnd");
      expect(container.classes()).not.toContain("is-swiping");
    });

    it("clears is-swiping on touchEnd immediately if swiper is not animating", async () => {
      mockRuntimeConfig.public.enableCarouselSwipeFix = true;
      const wrapper = mount(TheCarousel, mountOptions);
      const container = wrapper.find(".swiper-container");
      const swiper = wrapper.findComponent(Swiper);

      await swiper.vm.$emit("sliderMove");
      expect(container.classes()).toContain("is-swiping");

      // swiper animating is false
      await swiper.vm.$emit("touchEnd", { animating: false });
      expect(container.classes()).not.toContain("is-swiping");
    });

    it("registers swiper.on event listeners directly on swiper instance", async () => {
      mockRuntimeConfig.public.enableCarouselSwipeFix = true;
      const handlers: Record<string, (...args: unknown[]) => void> = {};
      const mockSwiper = {
        on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
          handlers[event] = handler;
        }),
        isBeginning: false,
        isEnd: false,
        animating: false,
      };

      const wrapper = mount(TheCarousel, mountOptions);
      const container = wrapper.find(".swiper-container");
      const swiper = wrapper.findComponent(Swiper);

      await swiper.vm.$emit("swiper", mockSwiper);

      expect(mockSwiper.on).toHaveBeenCalledWith(
        "sliderMove",
        expect.any(Function),
      );
      expect(mockSwiper.on).toHaveBeenCalledWith(
        "touchEnd",
        expect.any(Function),
      );
      expect(mockSwiper.on).toHaveBeenCalledWith(
        "transitionEnd",
        expect.any(Function),
      );

      handlers.sliderMove();
      await wrapper.vm.$nextTick();
      expect(container.classes()).toContain("is-swiping");

      handlers.transitionEnd();
      await wrapper.vm.$nextTick();
      expect(container.classes()).not.toContain("is-swiping");
    });
  });
});
