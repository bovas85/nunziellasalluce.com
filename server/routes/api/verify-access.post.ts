import { defineEventHandler, readBody, setCookie, setResponseStatus } from "h3";
import {
  AUTH_COOKIE_NAME,
  getCaseStudyPassword,
  hashSecret,
} from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const expectedPassword = getCaseStudyPassword(event);

  if (!expectedPassword) {
    setResponseStatus(event, 500);
    return {
      success: false,
      error: "Case study protection password is not configured on the server",
    };
  }

  const body = await readBody<{ password?: string }>(event).catch(() => ({}));
  const submittedPassword =
    typeof body?.password === "string" ? body.password.trim() : "";

  if (!submittedPassword) {
    setResponseStatus(event, 400);
    return {
      success: false,
      error: "Password is required",
    };
  }

  if (submittedPassword !== expectedPassword) {
    setResponseStatus(event, 401);
    return {
      success: false,
      error: "Incorrect password",
    };
  }

  const token = await hashSecret(expectedPassword);

  setCookie(event, AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return {
    success: true,
  };
});
