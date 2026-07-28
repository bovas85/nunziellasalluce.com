import { describe, it, expect, vi, afterEach } from "vitest";
import { triggerLazySizes } from "./lazysizes";

describe("triggerLazySizes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls lazySizes.loader.checkElems when lazySizes is present on window", () => {
    const checkElems = vi.fn();
    vi.stubGlobal("window", {
      lazySizes: { loader: { checkElems } },
    });

    triggerLazySizes();

    expect(checkElems).toHaveBeenCalledOnce();
  });

  it("does nothing when window.lazySizes is not present", () => {
    vi.stubGlobal("window", {});

    // Should not throw
    expect(() => triggerLazySizes()).not.toThrow();
  });

  it("does nothing when window is undefined (SSR context)", () => {
    vi.stubGlobal("window", undefined);

    expect(() => triggerLazySizes()).not.toThrow();
  });
});
