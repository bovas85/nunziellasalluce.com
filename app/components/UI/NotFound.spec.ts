import { describe, it, expect, vi, afterEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import NotFound from "./NotFound.vue";

const pushMock = vi.fn();

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock,
    }),
  };
});

vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("h3")>();
  return {
    ...actual,
    setResponseStatus: vi.fn(),
  };
});

vi.mock("#imports", async (importOriginal) => {
  const actual = await importOriginal<typeof import("#imports")>();
  return {
    ...actual,
    useHead: vi.fn(),
    useRequestEvent: vi.fn().mockReturnValue({}),
  };
});

describe("NotFound", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly and navigates to home on button click", async () => {
    const wrapper = await mountSuspended(NotFound);

    expect(wrapper.find(".page-not-found").exists()).toBe(true);

    const button = wrapper.find("button.button--sent");
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe("HOME");

    await button.trigger("click");

    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
