import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import TheCarousel from "./TheCarousel.vue";
import { Swiper } from "swiper/vue";
import type { Project, WPImage } from "~/types/acf";

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
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

    await swiper.vm.$emit("slideChange");

    expect(mockCheckElems).toHaveBeenCalled();
    delete globalObj.lazySizes;
  });
});
