import { configDefaults } from "vitest/config";
import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  resolve: {
    alias: { buffer: "node:buffer" },
  },
  test: {
    environment: "nuxt",
    setupFiles: ["./test-setup.ts"],
    // mountSuspended (Nuxt test utils) can be slow in CI — 10s prevents flaky timeouts
    testTimeout: 10000,
    exclude: [...configDefaults.exclude, "**/.worktree*/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: [
        "nuxt.config.ts",
        "**/*.d.ts",
        ".nuxt/**",
        ".output/**",
        "archive/**",
        "**/.worktree*/**",
      ],
    },
  },
});
