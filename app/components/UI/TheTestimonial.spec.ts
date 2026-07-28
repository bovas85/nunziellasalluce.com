import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import TheTestimonial from "./TheTestimonial.vue";
import type { Testimonial } from "~/types/acf";
import type { WPImage } from "~/types/wordpress";

describe("TheTestimonial", () => {
  const mockImage = {
    alt: "John Doe picture",
    sizes: {
      thumbnail: "https://example.com/thumbnail.jpg",
      medium: "https://example.com/medium.jpg",
    },
  } as unknown as WPImage;

  const mockTestimonial: Testimonial = {
    name: "John Doe",
    body: "This is a great testimonial.",
    image: mockImage,
  };

  it("renders a testimonial properly with all provided data", () => {
    const wrapper = mount(TheTestimonial, {
      props: {
        testimonial: mockTestimonial,
      },
    });

    expect(wrapper.find(".testimonial").exists()).toBe(true);
    expect(wrapper.find("img").exists()).toBe(true);
    expect(wrapper.find("img").attributes("src")).toBe(
      mockTestimonial.image.sizes.thumbnail,
    );
    expect(wrapper.find("img").attributes("data-src")).toBe(
      mockTestimonial.image.sizes.medium,
    );
    expect(wrapper.find("img").attributes("alt")).toBe(
      mockTestimonial.image.alt,
    );
    expect(wrapper.find("blockquote").text()).toContain(mockTestimonial.body);
    expect(wrapper.find(".author").text()).toBe(mockTestimonial.name);
  });

  it("renders fallback placeholders when the image is missing", () => {
    const testimonialWithoutImage: Testimonial = {
      name: "Jane Smith",
      body: "Another great testimonial without an image.",
      image: null as unknown as WPImage,
    };

    const wrapper = mount(TheTestimonial, {
      props: {
        testimonial: testimonialWithoutImage,
      },
    });

    expect(wrapper.find(".testimonial").exists()).toBe(true);
    expect(wrapper.find("img").exists()).toBe(true);
    expect(wrapper.find("img").attributes("src")).toBe(
      "https://placehold.it/200x200",
    );
    expect(wrapper.find("img").attributes("data-src")).toBe(
      "https://placehold.it/200x200",
    );
    expect(wrapper.find("img").attributes("alt")).toBeUndefined();
    expect(wrapper.find("blockquote").text()).toContain(
      testimonialWithoutImage.body,
    );
    expect(wrapper.find(".author").text()).toBe(testimonialWithoutImage.name);
  });

  it("doesn't render anything when testimonial prop is null", () => {
    const wrapper = mount(TheTestimonial, {
      props: {
        testimonial: null as unknown as Testimonial,
      },
    });

    expect(wrapper.find(".testimonial").exists()).toBe(false);
    expect(wrapper.html()).toBe("<!--v-if-->");
  });
});
