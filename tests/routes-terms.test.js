import { describe, it, expect } from "vitest";
import { handleTerms, termsAccepted, TERMS_VERSION } from "../functions/api/_lib/routes-terms.js";
import { makeMockCtx } from "./helpers/mock-ctx.js";
describe("routes-terms.ts import resolution", () => {
  it("resolves the .js-extension import to the real .ts file", () => {
    expect(typeof handleTerms).toBe("function");
    expect(typeof termsAccepted).toBe("function");
    expect(typeof TERMS_VERSION).toBe("string");
  });
});
describe("handleTerms", () => {
  it("returns null for routes it doesn't own", async () => {
    const ctx = makeMockCtx({ route: "settings", method: "GET" });
    expect(await handleTerms(ctx)).toBeNull();
  });
  it("rejects unauthenticated requests to terms/status", async () => {
    const ctx = makeMockCtx({ route: "terms/status", method: "GET", authed: () => false });
    const res = await handleTerms(ctx);
    expect(res.status).toBe(401);
  });
  it("reports accepted:false for an authed visitor with no acceptance row", async () => {
    const ctx = makeMockCtx({
      route: "terms/status",
      method: "GET",
      authed: () => true,
      currentVisitor: async () => ({ id: 1, email: "a@b.com" }),
      dbRespond: () => null
    });
    const res = await handleTerms(ctx);
    const body = await res.json();
    expect(body).toEqual({ version: TERMS_VERSION, accepted: false });
  });
  it("reports accepted:true once a matching acceptance row exists", async () => {
    const ctx = makeMockCtx({
      route: "terms/status",
      method: "GET",
      authed: () => true,
      currentVisitor: async () => ({ id: 1, email: "a@b.com" }),
      dbRespond: (sql) => sql.includes("terms_acceptances") ? { found: 1 } : null
    });
    const body = await (await handleTerms(ctx)).json();
    expect(body.accepted).toBe(true);
  });
  it("records an acceptance on terms/accept and echoes the current version", async () => {
    const ctx = makeMockCtx({
      route: "terms/accept",
      method: "POST",
      authed: () => true,
      currentVisitor: async () => ({ id: 1, email: "a@b.com" }),
      request: new Request("https://example.com/api/terms/accept", {
        method: "POST",
        headers: { "User-Agent": "vitest", "CF-Connecting-IP": "127.0.0.1" }
      })
    });
    const body = await (await handleTerms(ctx)).json();
    expect(body).toEqual({ ok: true, version: TERMS_VERSION });
  });
});
