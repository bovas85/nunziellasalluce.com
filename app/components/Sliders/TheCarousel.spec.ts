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
});
