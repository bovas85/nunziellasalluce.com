import type { H3Event } from "h3";
import { useRuntimeConfig } from "#imports";

export const AUTH_COOKIE_NAME = "case_study_access";

export async function hashSecret(secret: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(`case-study-auth:${secret}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getCaseStudyPassword(event?: H3Event): string {
  // 1. Cloudflare Workers env context
  const cfEnv = event
    ? (event.context as { cloudflare?: { env?: Record<string, unknown> } })
        ?.cloudflare?.env
    : undefined;
  if (
    typeof cfEnv?.CASE_STUDY_PASSWORD === "string" &&
    cfEnv.CASE_STUDY_PASSWORD
  ) {
    return cfEnv.CASE_STUDY_PASSWORD;
  }

  // 2. Nuxt runtimeConfig (server-side)
  try {
    const config = useRuntimeConfig(event);
    if (
      typeof config?.caseStudyPassword === "string" &&
      config.caseStudyPassword
    ) {
      return config.caseStudyPassword;
    }
  } catch {
    // Context or runtimeConfig unavailable in some test scenarios
  }

  // 3. Fallback to process.env
  return (
    process.env.CASE_STUDY_PASSWORD ||
    process.env.NUXT_CASE_STUDY_PASSWORD ||
    ""
  );
}
