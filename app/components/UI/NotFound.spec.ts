import { describe, it, expect, vi, afterEach, type Mock } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import NotFound from "./NotFound.vue";
import { useRouter } from "vue-router";
import { setResponseStatus } from "h3";

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRouter: vi.fn(),
  };
});

vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("h3")>();
  return {
    ...actual,
    setResponseStatus: vi.fn(),
  };
});

mockNuxtImport("useRequestEvent", () => {
  return vi.fn();
});

describe("NotFound", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders correctly", async () => {
    const pushMock = vi.fn();
    (useRouter as Mock).mockReturnValue({ push: pushMock });

    const wrapper = await mountSuspended(NotFound);

    expect(wrapper.find(".page-not-found").exists()).toBe(true);
    expect(wrapper.text()).toContain("HOME");
  });

  it("navigates to home when button is clicked", async () => {
    const pushMock = vi.fn();
    (useRouter as Mock).mockReturnValue({ push: pushMock });

    const wrapper = await mountSuspended(NotFound);

    const button = wrapper.find("button");
    await button.trigger("click");

    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("does not set response status on client environment", async () => {
    const pushMock = vi.fn();
    (useRouter as Mock).mockReturnValue({ push: pushMock });

    // In a browser/client test environment, import.meta.server is typically false or undefined
    // We expect the setup to run without issues and setResponseStatus should not be called
    await mountSuspended(NotFound);
    expect(setResponseStatus).not.toHaveBeenCalled();
  });
});
