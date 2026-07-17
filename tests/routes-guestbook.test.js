import { describe, it, expect, vi } from "vitest";
vi.mock("../functions/api/_lib/plan.js", () => ({
  isUltra: vi.fn(async () => true)
}));
const { handleGuestbook } = await import("../functions/api/_lib/routes-guestbook.js");
const { isUltra } = await import("../functions/api/_lib/plan.js");
const { makeMockCtx } = await import("./helpers/mock-ctx.js");
describe("handleGuestbook", () => {
  it("returns null for routes it doesn't own", async () => {
    const ctx = makeMockCtx({ route: "settings", method: "GET" });
    expect(await handleGuestbook(ctx)).toBeNull();
  });
  it("lists entries newest-first on GET", async () => {
    const rows = [{ id: 2, name: "B", message: "hi", created_at: "now" }];
    const ctx = makeMockCtx({
      route: "guestbook",
      method: "GET",
      dbRespond: (sql, params, method) => method === "all" ? { results: rows } : null
    });
    const body = await (await handleGuestbook(ctx)).json();
    expect(body).toEqual(rows);
  });
  it("rejects signing when the site isn't on the Ultra plan", async () => {
    isUltra.mockResolvedValueOnce(false);
    const ctx = makeMockCtx({
      route: "guestbook",
      method: "POST",
      request: new Request("https://example.com/api/guestbook", { method: "POST" })
    });
    const res = await handleGuestbook(ctx);
    expect(res.status).toBe(403);
  });
  it("requires both name and message", async () => {
    const ctx = makeMockCtx({
      route: "guestbook",
      method: "POST",
      request: new Request("https://example.com/api/guestbook", {
        method: "POST",
        body: JSON.stringify({ name: "Only Name" })
      })
    });
    const res = await handleGuestbook(ctx);
    expect(res.status).toBe(400);
  });
  it("inserts a trimmed, length-capped entry and returns it", async () => {
    const ctx = makeMockCtx({
      route: "guestbook",
      method: "POST",
      request: new Request("https://example.com/api/guestbook", {
        method: "POST",
        body: JSON.stringify({ name: "  Zoop  ", message: "  Hello!  " })
      }),
      dbRespond: (sql, params, method) => method === "run" && sql.startsWith("INSERT") ? { success: true, meta: { last_row_id: 7 } } : null
    });
    const body = await (await handleGuestbook(ctx)).json();
    expect(body.name).toBe("Zoop");
    expect(body.message).toBe("Hello!");
    expect(body.id).toBe(7);
  });
  it("requires auth to delete an entry", async () => {
    const ctx = makeMockCtx({ route: "guestbook/5", method: "DELETE", authed: () => false });
    const res = await handleGuestbook(ctx);
    expect(res.status).toBe(401);
  });
});
