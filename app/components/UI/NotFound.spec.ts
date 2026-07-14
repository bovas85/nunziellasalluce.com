import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import NotFound from "./NotFound.vue";

// Mock vue-router properly so Nuxt doesn't break
const pushMock = vi.fn();

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock,
      afterEach: vi.fn(),
      currentRoute: { value: { path: '/' } },
    }),
  };
});

describe("NotFound", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the 404 page and button", async () => {
    const wrapper = await mountSuspended(NotFound);

    expect(wrapper.exists()).toBe(true);

    const button = wrapper.find("button.button--sent");
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain("HOME");
  });

  it("navigates to HOME when the button is clicked", async () => {
    const wrapper = await mountSuspended(NotFound);

    const button = wrapper.find("button.button--sent");
    await button.trigger("click");

    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
