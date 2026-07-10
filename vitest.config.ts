import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
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
