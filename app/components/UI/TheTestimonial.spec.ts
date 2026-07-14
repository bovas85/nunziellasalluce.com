import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import TheTestimonial from "./TheTestimonial.vue";
import type { Testimonial, WPImage } from "~/types/acf";

describe("TheTestimonial", () => {
  const mockImage = {
    sizes: {
      thumbnail: "https://example.com/thumb.jpg",
      medium: "https://example.com/medium.jpg",
    },
    alt: "Testimonial Author Image",
  } as unknown as WPImage;

  it("renders correctly with a full testimonial prop", async () => {
    const testimonial: Testimonial = {
      name: "John Doe",
      body: "This is a great product!",
      image: mockImage,
    };

    const wrapper = await mountSuspended(TheTestimonial, {
      props: {
        testimonial,
      },
    });

    // Check if the component renders the testimonial div
    expect(wrapper.find(".testimonial").exists()).toBe(true);

    // Check if the text content is rendered correctly
    expect(wrapper.text()).toContain("This is a great product!");
    expect(wrapper.text()).toContain("John Doe");

    // Check if the image has the correct attributes
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("https://example.com/thumb.jpg");
    expect(img.attributes("data-src")).toBe("https://example.com/medium.jpg");
    expect(img.attributes("alt")).toBe("Testimonial Author Image");
  });

  it("renders correctly with a testimonial missing an image", async () => {
    const testimonial: Testimonial = {
      name: "Jane Smith",
      body: "I highly recommend this.",
      image: null as unknown as WPImage, // Simulate missing image
    };

    const wrapper = await mountSuspended(TheTestimonial, {
      props: {
        testimonial,
      },
    });

    expect(wrapper.find(".testimonial").exists()).toBe(true);
    expect(wrapper.text()).toContain("I highly recommend this.");
    expect(wrapper.text()).toContain("Jane Smith");

    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    // Check if the fallback image is used
    expect(img.attributes("src")).toBe("https://placehold.it/200x200");
    expect(img.attributes("data-src")).toBe("https://placehold.it/200x200");
    // alt should be undefined or empty
    expect(img.attributes("alt")).toBeFalsy();
  });

  it("does not render when testimonial prop is null", async () => {
    const wrapper = await mountSuspended(TheTestimonial, {
      props: {
        testimonial: null as unknown as Testimonial,
      },
    });

    expect(wrapper.find(".testimonial").exists()).toBe(false);
    expect(wrapper.html()).toBe("<!--v-if-->"); // Vue 3 empty comment node
  });
});
