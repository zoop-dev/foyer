export interface Env {
  DB: D1Database;
  FOYER_KV?: KVNamespace;
  AI?: unknown;
  ADMIN_PASSWORD?: string;
  ADMIN_PASSWORD_2?: string;
  DB_HTTP_URL?: string;
  DB_HTTP_SECRET?: string;
  DB_HTTP_NAME?: string;
  CF_ACCESS_CLIENT_ID?: string;
  CF_ACCESS_CLIENT_SECRET?: string;
  FOYER_PUBLIC?: string;
  FOYER_DOMAIN?: string;
  CF_PAGES?: string;
  CF_PAGES_BRANCH?: string;
  CF_PAGES_COMMIT_SHA?: string;
  CF_PAGES_URL?: string;
  VAPID_PUBLIC?: string;
  VAPID_PRIVATE?: string;
  RAG_URL?: string;
  RAG_DB?: string;
  [key: string]: unknown;
}

export interface NewSessionResult {
  token: string;
  sid: string;
}

export interface Ctx {
  route: string;
  method: string;
  request: Request;
  env: Env;
  headers: Record<string, string>;
  respond: (data: unknown, status?: number) => Response;
  compressJson: (str: string) => Promise<string>;
  decompressJson: (stored: string | null | undefined) => Promise<string | null | undefined>;
  waitUntil: (promise: Promise<unknown>) => void;
  CREATE_SESSIONS: string;
  CREATE_BANNED_EMAILS: string;
  CREATE_PAGES: string;
  authed: () => boolean;
  visitorAuthed: () => Promise<false | "banned" | "ok">;
  _adminRole: false | "owner" | "admin";
  can: (perm: string) => boolean;
  adminPerms: "all" | string[];
  ensureSessionCols: () => Promise<void>;
  newSession: (visitorId: number | string) => Promise<NewSessionResult>;
  currentVisitor: () => Promise<Record<string, unknown> | null>;
  sitePublic: () => Promise<boolean>;
  canView: () => Promise<boolean>;
}
