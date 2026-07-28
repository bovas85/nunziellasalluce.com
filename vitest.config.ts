import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    // mountSuspended (Nuxt test utils) can be slow in CI — 10s prevents flaky timeouts
    testTimeout: 10000,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: [
        "nuxt.config.ts",
        "**/*.d.ts",
        ".nuxt/**",
        ".output/**",
        "archive/**",
      ],
    },
  },
});
