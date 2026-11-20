import { describe, expect, it, vi } from "vitest";
import {
  isOrphanPreviewKv,
  isOrphanPreviewWorker,
  parseArgs,
  previewNamesForPr,
  PROD_KV_TITLE,
  PROD_WORKER_NAME,
  runCleanup,
} from "./cleanup-cloudflare-previews.mjs";

describe("cleanup-cloudflare-previews", () => {
  it("parses CLI flags and validates --pr", () => {
    expect(parseArgs(["--pr", "278", "--apply"])).toEqual({
      pr: 278,
      pruneOrphans: false,
      keepPrs: new Set(),
      apply: true,
      json: false,
    });

    expect(
      parseArgs(["--prune-orphans", "--keep-pr", "277, 278", "--json"]),
    ).toEqual({
      pr: null,
      pruneOrphans: true,
      keepPrs: new Set([277, 278]),
      apply: false,
      json: true,
    });

    expect(() => parseArgs([])).toThrow(/Specify either --pr/);
    expect(() => parseArgs(["--pr", "abc"])).toThrow(/Invalid --pr/);
  });

  it("never marks production Worker or KV namespace as orphaned", () => {
    expect(isOrphanPreviewWorker(PROD_WORKER_NAME)).toBe(false);
    expect(isOrphanPreviewWorker("unrelated-worker")).toBe(false);
    expect(
      isOrphanPreviewWorker("nunziellasalluce-nunziellasall6afle5n5xfzsxwy"),
    ).toBe(true);
    expect(isOrphanPreviewWorker("nunziellasalluce-branch-feat-foo")).toBe(
      true,
    );
    expect(
      isOrphanPreviewWorker("nunziellasalluce-pr-278", new Set([278])),
    ).toBe(false);
    expect(
      isOrphanPreviewWorker("nunziellasalluce-pr-278", new Set([277])),
    ).toBe(true);

    expect(isOrphanPreviewKv(PROD_KV_TITLE)).toBe(false);
    expect(isOrphanPreviewKv("other-kv")).toBe(false);
    expect(
      isOrphanPreviewKv("nunziellasalluce-ContactSubmissions-pr-276-abc123"),
    ).toBe(true);
    expect(
      isOrphanPreviewKv(
        "nunziellasalluce-ContactSubmissions-pr-278",
        new Set([278]),
      ),
    ).toBe(false);
  });

  it("deletes deterministic PR preview Worker and KV namespace on --pr --apply", async () => {
    expect(previewNamesForPr(278)).toEqual({
      workerName: "nunziellasalluce-pr-278",
      kvTitle: "nunziellasalluce-ContactSubmissions-pr-278",
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          result: [
            { id: "kv-prod", title: PROD_KV_TITLE },
            {
              id: "kv-278",
              title: "nunziellasalluce-ContactSubmissions-pr-278",
            },
          ],
          result_info: { total_pages: 1 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

    const res = await runCleanup(
      { pr: 278, pruneOrphans: false, keepPrs: new Set(), apply: true },
      { accountId: "acct", apiToken: "tok", fetchImpl: fetchMock },
    );

    expect(res).toEqual({
      ok: true,
      dryRun: false,
      targetWorkers: ["nunziellasalluce-pr-278"],
      targetKvs: ["nunziellasalluce-ContactSubmissions-pr-278"],
      deletedWorkers: ["nunziellasalluce-pr-278"],
      missingWorkers: [],
      deletedKvs: ["nunziellasalluce-ContactSubmissions-pr-278"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]![0]).toContain(
      "/workers/scripts/nunziellasalluce-pr-278",
    );
    expect(fetchMock.mock.calls[2]![0]).toContain(
      "/storage/kv/namespaces/kv-278",
    );
  });

  it("supports dry-run orphan pruning while protecting prod and open PRs", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          result: [
            { id: PROD_WORKER_NAME },
            { id: "nunziellasalluce-pr-278" },
            { id: "nunziellasalluce-nunziellasallold123" },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          result: [
            { id: "kv-prod", title: PROD_KV_TITLE },
            {
              id: "kv-278",
              title: "nunziellasalluce-ContactSubmissions-pr-278",
            },
            {
              id: "kv-old",
              title: "nunziellasalluce-ContactSubmissions-pr-1-xyz",
            },
          ],
          result_info: { total_pages: 1 },
        }),
      });

    const res = await runCleanup(
      { pr: null, pruneOrphans: true, keepPrs: new Set([278]), apply: false },
      { accountId: "acct", apiToken: "tok", fetchImpl: fetchMock },
    );

    expect(res).toEqual({
      ok: true,
      dryRun: true,
      targetWorkers: ["nunziellasalluce-nunziellasallold123"],
      targetKvs: ["nunziellasalluce-ContactSubmissions-pr-1-xyz"],
      deletedWorkers: [],
      missingWorkers: [],
      deletedKvs: [],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
