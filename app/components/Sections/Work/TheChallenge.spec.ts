import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import TheChallenge from "./TheChallenge.vue";
import type { ProjectACF } from "~/types/acf";
import UILazyImage from "~/components/UI/LazyImage.vue";

describe("TheChallenge Component", () => {
  const mockBaseChallenge = {
    title: "Test Challenge Title",
    body: "Test Challenge Body",
    left_list: {
      title: "Insights",
      list_item: [{ item: "Insight 1" }, { item: "Insight 2" }]
    },
    right_list: {
      title: "Action",
      list_item: [{ item: "Action 1" }]
    },
    flexible_content: []
  };

  const createMockProject = (challengeData: any = mockBaseChallenge): ProjectACF => {
    return {
      challenge: challengeData
    } as unknown as ProjectACF;
  };

  it("does not render when project.challenge is null", async () => {
    const wrapper = await mountSuspended(TheChallenge, {
      props: {
        project: createMockProject(null),
        animateChallenge: false,
      },
    });

    expect(wrapper.find(".the-challenge").exists()).toBe(false);
  });

  it("renders title, body, and lists correctly", async () => {
    const wrapper = await mountSuspended(TheChallenge, {
      props: {
        project: createMockProject(),
        animateChallenge: false,
      },
    });

    expect(wrapper.find("h1").text()).toBe("Test Challenge Title");
    expect(wrapper.find(".text-section p").text()).toBe("Test Challenge Body");

    const leftListItems = wrapper.findAll(".column--left li");
    expect(leftListItems.length).toBe(2);
    expect(leftListItems[0].text()).toBe("Insight 1");
    expect(leftListItems[1].text()).toBe("Insight 2");

    const rightListItems = wrapper.findAll(".column--right li");
    expect(rightListItems.length).toBe(1);
    expect(rightListItems[0].text()).toBe("Action 1");
  });

  it("applies animated class when animateChallenge is true", async () => {
    const wrapper = await mountSuspended(TheChallenge, {
      props: {
        project: createMockProject(),
        animateChallenge: true,
      },
    });

    expect(wrapper.find(".text-section").classes()).toContain("animated");
    expect(wrapper.find(".column--left").classes()).toContain("animated");
    expect(wrapper.find(".column--right").classes()).toContain("animated");
  });

  it("renders flexible content - image layout", async () => {
    const mockProject = createMockProject({
      ...mockBaseChallenge,
      flexible_content: [
        {
          acf_fc_layout: "image",
          image: { url: "test-image.jpg" }
        }
      ]
    });

    const wrapper = await mountSuspended(TheChallenge, {
      props: {
        project: mockProject,
        animateChallenge: false,
      },
    });

    const flexibleContainer = wrapper.find(".flexible-content");
    expect(flexibleContainer.exists()).toBe(true);

    const imageWrapper = flexibleContainer.find(".image");
    expect(imageWrapper.exists()).toBe(true);
    // Since UILazyImage is a component, we can check for it
    expect(wrapper.findComponent(UILazyImage).exists()).toBe(true);
  });

  it("renders flexible content - text layout", async () => {
    const mockProject = createMockProject({
      ...mockBaseChallenge,
      flexible_content: [
        {
          acf_fc_layout: "text",
          text: "Flexible content text"
        }
      ]
    });

    const wrapper = await mountSuspended(TheChallenge, {
      props: {
        project: mockProject,
        animateChallenge: false,
      },
    });

    const textElement = wrapper.find(".flexible-content p");
    expect(textElement.exists()).toBe(true);
    expect(textElement.text()).toBe("Flexible content text");
  });

  it("renders flexible content - other (double_image) layout", async () => {
    const mockProject = createMockProject({
      ...mockBaseChallenge,
      flexible_content: [
        {
          acf_fc_layout: "double_image",
          double_image: { url: "test-double.jpg" }
        }
      ]
    });

    const wrapper = await mountSuspended(TheChallenge, {
      props: {
        project: mockProject,
        animateChallenge: false,
      },
    });

    const doubleImageWrapper = wrapper.find(".flexible-content .double_image");
    expect(doubleImageWrapper.exists()).toBe(true);
    const uiLazyImage = wrapper.findComponent(UILazyImage);
    expect(uiLazyImage.exists()).toBe(true);
    // Position right is a prop on UILazyImage for double_image
    expect(uiLazyImage.props("position")).toBe("right");
  });
});
