import { vi } from "vitest";
export function makeMockDb(respond = () => null) {
  const calls = [];
  const db = {
    prepare(sql) {
      const stmt = {
        _sql: sql,
        _params: [],
        bind(...args) {
          stmt._params = args;
          return stmt;
        },
        async first() {
          calls.push({ sql, params: stmt._params, method: "first" });
          return respond(sql, stmt._params, "first");
        },
        async run() {
          calls.push({ sql, params: stmt._params, method: "run" });
          const r = respond(sql, stmt._params, "run");
          return r ?? { success: true, meta: {}, results: [] };
        },
        async all() {
          calls.push({ sql, params: stmt._params, method: "all" });
          const r = respond(sql, stmt._params, "all");
          return r ?? { success: true, results: [] };
        }
      };
      return stmt;
    }
  };
  return { db, calls };
}
export function makeMockCtx(overrides = {}) {
  const { db } = makeMockDb(overrides.dbRespond);
  const respond = vi.fn((data, status = 200) => new Response(JSON.stringify(data), { status }));
  const base = {
    route: "",
    method: "GET",
    request: new Request("https://example.com/api/x"),
    env: { DB: db, ...overrides.env },
    headers: {},
    respond,
    compressJson: async (s) => s,
    decompressJson: async (s) => s,
    waitUntil: () => {
    },
    CREATE_SESSIONS: "",
    CREATE_BANNED_EMAILS: "",
    CREATE_PAGES: "",
    authed: () => false,
    visitorAuthed: async () => false,
    _adminRole: false,
    can: () => true,
    adminPerms: "all",
    ensureSessionCols: async () => {
    },
    newSession: async () => ({ token: "tok", sid: "sid" }),
    currentVisitor: async () => null,
    sitePublic: async () => true,
    canView: async () => true
  };
  return { ...base, ...overrides, env: base.env, respond };
}
