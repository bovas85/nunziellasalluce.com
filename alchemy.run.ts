import * as Alchemy from "alchemy";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Effect from "effect/Effect";

// 1. Declare Cloudflare Resources (e.g. KV namespace for contact submissions)
export const SubmissionsKV = Cloudflare.KV.Namespace("ContactSubmissions");

// 2. Declare the Nuxt Site using native Cloudflare.Website.Nuxt
export const Website = Cloudflare.Website.Nuxt("NunziellaSalluceSite", {
  env: {
    SUBMISSIONS: SubmissionsKV,
  },
});

export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>;

// 3. Define the Alchemy Stack
export default Alchemy.Stack(
  "nunziellasalluce",
  {
    providers: Cloudflare.providers(),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const site = yield* Website;
    return {
      url: site.url,
    };
  }),
);
