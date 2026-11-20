import * as Alchemy from "alchemy";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

const PROD_STAGE = "prod";
// Existing Cloudflare Worker currently serving nunziellasalluce.com & www.nunziellasalluce.com.
// Pinning this name on the `prod` stage updates production in-place without detaching custom domains.
const PROD_WORKER_NAME =
  "nunziellasalluce-nunziellasall6vkqibl253uw4fwqtcyeuiwu";
const PROD_DOMAIN = {
  name: "nunziellasalluce.com",
  aliases: ["www.nunziellasalluce.com"],
} as const;
const PROD_KV_TITLE = "nunziellasalluce-ContactSubmissions-prod";

function sanitizePreviewStage(stage: string): string {
  const normalized = stage
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 38)
    .replace(/-+$/, "");
  if (!normalized) return "preview";
  return normalized === PROD_STAGE ? "prod-preview" : normalized;
}

// 1. Declare Cloudflare Resources (pinned by title on every stage so CI adopts and
// updates the same namespace in-place instead of leaking per-run resources)
export const SubmissionsKV = Cloudflare.KV.Namespace(
  "ContactSubmissions",
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;
    return {
      title:
        stage === PROD_STAGE
          ? PROD_KV_TITLE
          : `nunziellasalluce-ContactSubmissions-${sanitizePreviewStage(stage)}`,
    };
  }),
);

// 2. Declare the Nuxt Site using native Cloudflare.Website.Nuxt
export const Website = Cloudflare.Website.Nuxt(
  "NunziellaSalluceSite",
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;
    const isProd = stage === PROD_STAGE;
    const workerName = isProd
      ? PROD_WORKER_NAME
      : `nunziellasalluce-${sanitizePreviewStage(stage)}`;
    const caseStudyPassword = yield* Config.Redacted(
      "CASE_STUDY_PASSWORD",
    ).pipe(Config.withDefault(Redacted.make("")), Effect.orDie);

    if (isProd && Redacted.value(caseStudyPassword).trim().length === 0) {
      return yield* Effect.die(
        new Error(
          "CASE_STUDY_PASSWORD must be non-empty when deploying the prod stage.",
        ),
      );
    }

    return {
      name: workerName,
      ...(isProd
        ? {
            domain: {
              name: PROD_DOMAIN.name,
              aliases: [...PROD_DOMAIN.aliases],
            },
          }
        : {}),
      env: {
        SUBMISSIONS: SubmissionsKV,
        CASE_STUDY_PASSWORD: caseStudyPassword,
        PROTECTED_CASE_STUDIES: Config.String("PROTECTED_CASE_STUDIES").pipe(
          Config.withDefault(""),
        ),
      },
    };
  }),
);

export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>;

// 3. Define the Alchemy Stack
export default Alchemy.Stack(
  "nunziellasalluce",
  {
    providers: Cloudflare.providers(),
    // Note: Cloudflare.state() requires `Secrets Store: Edit` on CLOUDFLARE_API_TOKEN.
    // Local state + pinned `prod` Worker name / KV title + `--adopt` updates prod in-place.
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const site = yield* Website;
    return {
      url: site.url,
    };
  }),
);
