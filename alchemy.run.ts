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

const useCloudflareState = Boolean(
  process.env.CI ||
  (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN),
);

// 1. Declare Cloudflare Resources (stage-scoped so PR previews isolate from prod;
// no server routes read or write SUBMISSIONS yet)
export const SubmissionsKV = Cloudflare.KV.Namespace("ContactSubmissions");

// 2. Declare the Nuxt Site using native Cloudflare.Website.Nuxt
export const Website = Cloudflare.Website.Nuxt(
  "NunziellaSalluceSite",
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;
    const isProd = stage === PROD_STAGE;
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
      ...(isProd
        ? {
            name: PROD_WORKER_NAME,
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
    state: useCloudflareState ? Cloudflare.state() : Alchemy.localState(),
  },
  Effect.gen(function* () {
    const site = yield* Website;
    return {
      url: site.url,
    };
  }),
);
