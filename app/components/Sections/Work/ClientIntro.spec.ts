import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import ClientIntro from "./ClientIntro.vue";
import type { ProjectACF } from "~/types/acf";

describe("ClientIntro Component", () => {
  const mockProject = {
    intro: {
      heading: "Mock Heading",
      client_name: "Mock Client Name",
      link: "https://example.com",
      image: {
        url: "https://example.com/image.jpg",
        sizes: {
          small: "https://example.com/image.jpg",
          medium: "https://example.com/image.jpg",
          large: "https://example.com/image.jpg",
          ultra: "https://example.com/image.jpg",
        },
      },
      deliverables: [{ item: "Item 1" }, { item: "Item 2" }],
    },
  } as unknown as ProjectACF;

  it("renders the launch site link with target='_blank' and rel='noopener noreferrer'", async () => {
    const wrapper = await mountSuspended(ClientIntro, {
      props: {
        project: mockProject,
        animateIntro: true,
      },
    });

    const link = wrapper.find("a.animated-border");
    expect(link.exists()).toBe(true);
    expect(link.attributes("target")).toBe("_blank");
    expect(link.attributes("rel")).toBe("noopener noreferrer");
  });
});
