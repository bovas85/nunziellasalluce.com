import { defineEventHandler, getCookie } from "h3";
import {
  AUTH_COOKIE_NAME,
  getCaseStudyPassword,
  hashSecret,
} from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const expectedPassword = getCaseStudyPassword(event);

  if (!expectedPassword) {
    return { authenticated: false };
  }

  const cookie = getCookie(event, AUTH_COOKIE_NAME);
  if (!cookie) {
    return { authenticated: false };
  }

  const expectedToken = await hashSecret(expectedPassword);
  return {
    authenticated: cookie === expectedToken,
  };
});
