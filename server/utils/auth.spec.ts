import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { H3Event } from "h3";
import { AUTH_COOKIE_NAME, getCaseStudyPassword, hashSecret } from "./auth";

describe("server/utils/auth", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("exports correct cookie name", () => {
    expect(AUTH_COOKIE_NAME).toBe("case_study_access");
  });

  it("hashes secret consistently with SHA-256 hex string", async () => {
    const hash1 = await hashSecret("secret-password");
    const hash2 = await hashSecret("secret-password");
    const hash3 = await hashSecret("different-password");

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex length
    expect(hash1).not.toBe(hash3);
  });

  it("reads password from Cloudflare context binding when present", () => {
    const mockEvent = {
      context: {
        cloudflare: {
          env: {
            CASE_STUDY_PASSWORD: "cf-edge-secret-123",
          },
        },
      },
    } as unknown as H3Event;

    const password = getCaseStudyPassword(mockEvent);
    expect(password).toBe("cf-edge-secret-123");
  });

  it("falls back to process.env.CASE_STUDY_PASSWORD when event has no CF binding", () => {
    process.env.CASE_STUDY_PASSWORD = "env-secret-456";
    const password = getCaseStudyPassword();
    expect(password).toBe("env-secret-456");
  });

  it("falls back to process.env.NUXT_CASE_STUDY_PASSWORD if CASE_STUDY_PASSWORD is unset", () => {
    delete process.env.CASE_STUDY_PASSWORD;
    process.env.NUXT_CASE_STUDY_PASSWORD = "nuxt-env-secret-789";
    const password = getCaseStudyPassword();
    expect(password).toBe("nuxt-env-secret-789");
  });

  it("returns empty string when no password is configured", () => {
    delete process.env.CASE_STUDY_PASSWORD;
    delete process.env.NUXT_CASE_STUDY_PASSWORD;
    const password = getCaseStudyPassword();
    expect(password).toBe("");
  });
});
