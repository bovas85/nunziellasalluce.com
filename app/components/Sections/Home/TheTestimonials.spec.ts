import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import TheTestimonials from "./TheTestimonials.vue";
import type { HomePageACF, Testimonial } from "~/types/acf";

describe("TheTestimonials", () => {
  const mockTestimonials: Testimonial[] = [
    {
      name: "John Doe",
      title: "CEO",
      quote: "Great work!",
      company: "Company A"
    },
    {
      name: "Jane Smith",
      title: "CTO",
      quote: "Amazing experience.",
      company: "Company B"
    },
    {
      name: "Bob Johnson",
      title: "Designer",
      quote: "Highly recommended.",
      company: "Company C"
    }
  ];

  const mockACF = {
    testimonials: {
      title: "What people say"
    }
  } as unknown as HomePageACF;

  it("renders correctly with provided ACF data and testimonials", async () => {
    const wrapper = await mountSuspended(TheTestimonials, {
      props: {
        acf: mockACF,
        testimonials: mockTestimonials,
        animateTestimonials: false,
      }
    });

    // Check main title
    expect(wrapper.find("h1").text()).toBe("What people say");

    // We can check that the components are passed via props correctly
    // or we can check the disabled arrows status to verify currentTestimonial logic.
    const leftArrow = wrapper.find(".arrow--left");
    const rightArrow = wrapper.find(".arrow--right");

    expect(leftArrow.exists()).toBe(true);
    expect(rightArrow.exists()).toBe(true);

    // Initially currentTestimonial is 0, so left arrow should be disabled
    expect(leftArrow.classes()).toContain("is-disabled");
    expect(rightArrow.classes()).not.toContain("is-disabled");
  });

  it("navigates through testimonials using arrows", async () => {
    const wrapper = await mountSuspended(TheTestimonials, {
      props: {
        acf: mockACF,
        testimonials: mockTestimonials,
        animateTestimonials: false,
      }
    });

    const leftArrow = wrapper.find(".arrow--left");
    const rightArrow = wrapper.find(".arrow--right");

    // Click right arrow
    await rightArrow.trigger("click");

    // Now index is 1, neither should be disabled
    expect(leftArrow.classes()).not.toContain("is-disabled");
    expect(rightArrow.classes()).not.toContain("is-disabled");

    // Click right arrow again
    await rightArrow.trigger("click");

    // Now index is 2 (last), right arrow should be disabled
    expect(leftArrow.classes()).not.toContain("is-disabled");
    expect(rightArrow.classes()).toContain("is-disabled");

    // Click right arrow again (should have no effect because we bounded it in the component)
    await rightArrow.trigger("click");
    expect(rightArrow.classes()).toContain("is-disabled");

    // Click left arrow
    await leftArrow.trigger("click");

    // Now index is 1 again
    expect(leftArrow.classes()).not.toContain("is-disabled");
    expect(rightArrow.classes()).not.toContain("is-disabled");
  });

  it("applies animation classes when animateTestimonials is true", async () => {
    const wrapper = await mountSuspended(TheTestimonials, {
      props: {
        acf: mockACF,
        testimonials: mockTestimonials,
        animateTestimonials: true,
      }
    });

    expect(wrapper.find(".container").classes()).toContain("animated");
    expect(wrapper.find(".wrapper").classes()).toContain("animated");
  });

  it("does not apply animation classes when animateTestimonials is false", async () => {
    const wrapper = await mountSuspended(TheTestimonials, {
      props: {
        acf: mockACF,
        testimonials: mockTestimonials,
        animateTestimonials: false,
      }
    });

    expect(wrapper.find(".container").classes()).not.toContain("animated");
    expect(wrapper.find(".wrapper").classes()).not.toContain("animated");
  });

  it("does not render when acf is missing", async () => {
    const wrapper = await mountSuspended(TheTestimonials, {
      props: {
        acf: undefined as unknown as HomePageACF,
        testimonials: mockTestimonials,
        animateTestimonials: false,
      }
    });

    expect(wrapper.find("section.testimonials").exists()).toBe(false);
  });
});
