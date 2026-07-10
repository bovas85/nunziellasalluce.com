// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: {
    pageTransition: { name: "intro", mode: "out-in" },
    head: {
      link: [{ rel: "icon", type: "image/png", href: "/icon.png" }],
    },
  },
  css: ["~/assets/css/main.scss"],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/css/variables.scss" as *;',
          silenceDeprecations: [
            "color-functions",
            "if-function",
            "import",
            "global-builtin",
            "legacy-js-api",
          ],
        },
      },
    },
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "lazysizes",
        "scrollama",
        "splitting",
        "swiper/modules",
        "swiper/vue",
      ],
    },
  },
  modules: ["@vueuse/nuxt", "@nuxt/eslint"],
  eslint: {
    checker: false,
  },
  postcss: {
    plugins: {
      "postcss-responsive-type": {},
    },
  },
  routeRules: {
    "/wp-json/**": {
      proxy: "https://nunziella.moustachedesign.xyz/wp-json/**",
    },
  },
  hooks: {
    async "nitro:config"(nitroConfig) {
      if (nitroConfig.dev) return;
      // Fetch all published case studies from WP and add their slugs as prerender routes
      try {
        const res = await fetch(
          "https://nunziella.moustachedesign.xyz/wp-json/wp/v2/casestudies?per_page=100",
        );
        const projects = (await res.json()) as Array<{
          slug: string;
          acf?: { status?: string };
        }>;
        const slugRoutes = projects
          .filter((p) => p.acf?.status === "true")
          .map((p) => `/${p.slug}`);
        nitroConfig.prerender = nitroConfig.prerender || {};
        nitroConfig.prerender.routes = [
          ...(nitroConfig.prerender.routes ?? []),
          ...slugRoutes,
        ];
      } catch (e) {
        console.warn("[prerender] Failed to fetch case study slugs:", e);
      }
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: false,
      routes: ["/", "/about", "/contact", "/privacy-policy"],
    },
  },
});
