import { execFile } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const CLI_PATH = path.resolve("tools/control-nunziella.mjs");
const KV_SCRIPT_PATH = path.resolve("tools/verify-kv-restore.mjs");

describe("control-nunziella CLI", () => {
  it("validates Feature Map sync with app/pages and server/routes", async () => {
    const { stdout } = await execFileAsync("node", [
      CLI_PATH,
      "map",
      "--check",
      "--json",
    ]);
    const parsed = JSON.parse(stdout);
    expect(parsed.ok).toBe(true);
    expect(parsed.errors).toEqual([]);
    expect(parsed.codeRoutes).toContain("/");
    expect(parsed.codeRoutes).toContain("/health.json");
    expect(parsed.codeRoutes).toContain("/api/verify-access");
  });

  it("performs request --contains and health checks against an HTTP endpoint", async () => {
    const server = http.createServer((req, res) => {
      if (req.url === "/health.json") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            ok: true,
            status: "healthy",
            commitSha: "abc1234567",
          }),
        );
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<html><body>Nunziella Salluce</body></html>");
    });

    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    const origin = `http://127.0.0.1:${port}`;

    try {
      const reqRes = await execFileAsync("node", [
        CLI_PATH,
        "request",
        "GET",
        "/",
        "--origin",
        origin,
        "--contains",
        "Nunziella",
        "--json",
      ]);
      const reqJson = JSON.parse(reqRes.stdout);
      expect(reqJson.ok).toBe(true);
      expect(reqJson.containsMatched).toBe(true);

      const healthRes = await execFileAsync("node", [
        CLI_PATH,
        "health",
        "--origin",
        origin,
        "--sha",
        "abc1234",
        "--json",
      ]);
      const healthJson = JSON.parse(healthRes.stdout);
      expect(healthJson.ok).toBe(true);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("runs isolated KV backup/restore roundtrip drill cleanly", async () => {
    const { stdout } = await execFileAsync("node", [KV_SCRIPT_PATH]);
    const parsed = JSON.parse(stdout);
    expect(parsed.ok).toBe(true);
    expect(parsed.mode).toBe("isolated-dry-run");
    expect(parsed.restoredCount).toBeGreaterThan(0);
  });
});
