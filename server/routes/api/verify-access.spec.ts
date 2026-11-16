import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { H3Event } from "h3";
import postHandler from "./verify-access.post";
import getHandler from "./verify-access.get";
import { hashSecret, AUTH_COOKIE_NAME } from "../../utils/auth";

let mockBody: Record<string, unknown> = {};
let mockCookies: Record<string, string> = {};
let responseStatus: number | undefined;

vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("h3")>();
  return {
    ...actual,
    readBody: vi.fn(async () => mockBody),
    getCookie: vi.fn((_event: H3Event, name: string) => mockCookies[name]),
    setCookie: vi.fn(
      (_event: H3Event, name: string, value: string, _options: unknown) => {
        mockCookies[name] = value;
      },
    ),
    setResponseStatus: vi.fn((_event: H3Event, status: number) => {
      responseStatus = status;
    }),
  };
});

describe("/api/verify-access", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.CASE_STUDY_PASSWORD = "super-secret-password";
    mockBody = {};
    mockCookies = {};
    responseStatus = undefined;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("POST /api/verify-access", () => {
    it("returns 500 if protection password is not configured on server", async () => {
      delete process.env.CASE_STUDY_PASSWORD;
      delete process.env.NUXT_CASE_STUDY_PASSWORD;

      const mockEvent = {} as H3Event;
      const res = await postHandler(mockEvent);

      expect(responseStatus).toBe(500);
      expect(res).toEqual({
        success: false,
        error: "Case study protection password is not configured on the server",
      });
    });

    it("returns 400 if password is empty", async () => {
      mockBody = { password: "" };
      const mockEvent = {} as H3Event;
      const res = await postHandler(mockEvent);

      expect(responseStatus).toBe(400);
      expect(res).toEqual({
        success: false,
        error: "Password is required",
      });
    });

    it("returns 401 if submitted password does not match", async () => {
      mockBody = { password: "wrong-password" };
      const mockEvent = {} as H3Event;
      const res = await postHandler(mockEvent);

      expect(responseStatus).toBe(401);
      expect(res).toEqual({
        success: false,
        error: "Incorrect password",
      });
      expect(mockCookies[AUTH_COOKIE_NAME]).toBeUndefined();
    });

    it("returns 200 and sets secure cookie when password matches", async () => {
      mockBody = { password: "super-secret-password" };
      const mockEvent = {} as H3Event;
      const res = await postHandler(mockEvent);

      expect(res).toEqual({ success: true });
      const expectedToken = await hashSecret("super-secret-password");
      expect(mockCookies[AUTH_COOKIE_NAME]).toBe(expectedToken);
    });

    it("trims whitespace from submitted password before comparison", async () => {
      mockBody = { password: "  super-secret-password  " };
      const mockEvent = {} as H3Event;
      const res = await postHandler(mockEvent);

      expect(res).toEqual({ success: true });
      const expectedToken = await hashSecret("super-secret-password");
      expect(mockCookies[AUTH_COOKIE_NAME]).toBe(expectedToken);
    });
  });

  describe("GET /api/verify-access", () => {
    it("returns authenticated: false when no password configured on server", async () => {
      delete process.env.CASE_STUDY_PASSWORD;
      delete process.env.NUXT_CASE_STUDY_PASSWORD;

      const mockEvent = {} as H3Event;
      const res = await getHandler(mockEvent);
      expect(res).toEqual({ authenticated: false });
    });

    it("returns authenticated: false when cookie is missing", async () => {
      const mockEvent = {} as H3Event;
      const res = await getHandler(mockEvent);
      expect(res).toEqual({ authenticated: false });
    });

    it("returns authenticated: false when cookie contains invalid token", async () => {
      mockCookies[AUTH_COOKIE_NAME] = "invalid-token-value";
      const mockEvent = {} as H3Event;
      const res = await getHandler(mockEvent);
      expect(res).toEqual({ authenticated: false });
    });

    it("returns authenticated: true when cookie contains valid hash token", async () => {
      const validToken = await hashSecret("super-secret-password");
      mockCookies[AUTH_COOKIE_NAME] = validToken;

      const mockEvent = {} as H3Event;
      const res = await getHandler(mockEvent);
      expect(res).toEqual({ authenticated: true });
    });
  });
});
