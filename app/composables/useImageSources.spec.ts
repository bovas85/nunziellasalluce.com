import { describe, it, expect, vi, afterEach } from "vitest";
import { useImageSources } from "./useImageSources";
import { ref } from "vue";
import type { WPImage } from "~/types/acf";

describe("useImageSources", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("mobileSrc", () => {
    it("returns specific URL for bio-nunziella-salluce-design.jpg", () => {
      const isMobile = ref(false);
      const props = {
        image: { url: "BIO-NUNZIELLA-SALLUCE-DESIGN.jpg" } as WPImage,
      };
      const { mobileSrc } = useImageSources(props, isMobile);
      expect(mobileSrc.value).toBe(
        "https://nunziella.moustachedesign.fyi/wp-content/uploads/2019/05/Bio-Nunziella-Salluce-Design-mobile.jpg"
      );
    });

    it("returns imageMobile.url if it exists and id is different from image.id", () => {
      const isMobile = ref(false);
      const props = {
        image: { id: 1 } as WPImage,
        imageMobile: { id: 2, url: "mobile.jpg" } as WPImage,
      };
      const { mobileSrc } = useImageSources(props, isMobile);
      expect(mobileSrc.value).toBe("mobile.jpg");
    });

    it("falls back to image.sizes.medium if imageMobile is not used", () => {
      const isMobile = ref(false);
      const props = {
        image: { id: 1, sizes: { medium: "medium.jpg" } } as unknown as WPImage,
        imageMobile: { id: 1, url: "mobile.jpg" } as WPImage, // Same id, should not be used
      };
      const { mobileSrc } = useImageSources(props, isMobile);
      expect(mobileSrc.value).toBe("medium.jpg");
    });

    it("falls back to image.url if medium size is missing", () => {
      const isMobile = ref(false);
      const props = {
        image: { id: 1, sizes: {}, url: "original.jpg" } as unknown as WPImage,
      };
      const { mobileSrc } = useImageSources(props, isMobile);
      expect(mobileSrc.value).toBe("original.jpg");
    });

    it("returns empty string if all fallbacks fail", () => {
      const isMobile = ref(false);
      const props = {};
      const { mobileSrc } = useImageSources(props, isMobile);
      expect(mobileSrc.value).toBe("");
    });
  });

  describe("getImage", () => {
    it("returns image.sizes.small if isThumb is true and size exists", () => {
      const isMobile = ref(false);
      const props = {
        isThumb: true,
        image: { sizes: { small: "small.jpg" } } as unknown as WPImage,
      };
      const { getImage } = useImageSources(props, isMobile);
      expect(getImage.value).toBe("small.jpg");
    });

    it("returns false if isThumb is false", () => {
      const isMobile = ref(false);
      const props = {
        isThumb: false,
        image: { sizes: { small: "small.jpg" } } as unknown as WPImage,
      };
      const { getImage } = useImageSources(props, isMobile);
      expect(getImage.value).toBe(false);
    });

    it("returns false if small size is missing", () => {
      const isMobile = ref(false);
      const props = {
        isThumb: true,
        image: { sizes: {} } as unknown as WPImage,
      };
      const { getImage } = useImageSources(props, isMobile);
      expect(getImage.value).toBe(false);
    });
  });

  describe("fallbackSrc", () => {
    describe("when isMobile is true (getMobileFallback)", () => {
      it("returns mobileSrc if import.meta.client is true and window.innerWidth < 577", () => {
        vi.stubGlobal("window", { innerWidth: 500 });
        const isMobile = ref(true);
        const props = {
          image: { id: 1, url: "desktop.jpg" } as WPImage,
          imageMobile: { id: 2, url: "mobile.jpg" } as WPImage,
        };
        const { fallbackSrc } = useImageSources(props, isMobile);
        // Uses mobileSrc because conditions are met
        expect(fallbackSrc.value).toBe("mobile.jpg");
      });

      it("returns image.sizes.large if import.meta.client is true but window.innerWidth >= 577", () => {
        vi.stubGlobal("window", { innerWidth: 600 });
        const isMobile = ref(true);
        const props = {
          image: { id: 1, sizes: { large: "large.jpg" }, url: "desktop.jpg" } as unknown as WPImage,
          imageMobile: { id: 2, url: "mobile.jpg" } as WPImage,
        };
        const { fallbackSrc } = useImageSources(props, isMobile);
        expect(fallbackSrc.value).toBe("large.jpg");
      });

      it("returns image.url if window.innerWidth >= 577 and large size is missing", () => {
        vi.stubGlobal("window", { innerWidth: 600 });
        const isMobile = ref(true);
        const props = {
          image: { id: 1, sizes: {}, url: "desktop.jpg" } as unknown as WPImage,
        };
        const { fallbackSrc } = useImageSources(props, isMobile);
        expect(fallbackSrc.value).toBe("desktop.jpg");
      });

      it("returns empty string if all mobile fallbacks fail", () => {
        vi.stubGlobal("window", { innerWidth: 800 });
        const isMobile = ref(true);
        const props = {};
        const { fallbackSrc } = useImageSources(props, isMobile);
        expect(fallbackSrc.value).toBe("");
      });
    });

    describe("when isMobile is false (getDesktopFallback)", () => {
      it("returns getImage value if truthy", () => {
        const isMobile = ref(false);
        const props = {
          isThumb: true,
          image: { sizes: { small: "small.jpg", ultra: "ultra.jpg" }, url: "desktop.jpg" } as unknown as WPImage,
        };
        const { fallbackSrc } = useImageSources(props, isMobile);
        expect(fallbackSrc.value).toBe("small.jpg");
      });

      it("returns image.sizes.ultra if getImage is falsy", () => {
        const isMobile = ref(false);
        const props = {
          isThumb: false,
          image: { sizes: { small: "small.jpg", ultra: "ultra.jpg" }, url: "desktop.jpg" } as unknown as WPImage,
        };
        const { fallbackSrc } = useImageSources(props, isMobile);
        expect(fallbackSrc.value).toBe("ultra.jpg");
      });

      it("returns image.url if ultra size is missing", () => {
        const isMobile = ref(false);
        const props = {
          isThumb: false,
          image: { sizes: { small: "small.jpg" }, url: "desktop.jpg" } as unknown as WPImage,
        };
        const { fallbackSrc } = useImageSources(props, isMobile);
        expect(fallbackSrc.value).toBe("desktop.jpg");
      });

      it("returns empty string if all desktop fallbacks fail", () => {
        const isMobile = ref(false);
        const props = {};
        const { fallbackSrc } = useImageSources(props, isMobile);
        expect(fallbackSrc.value).toBe("");
      });
    });
  });
});
