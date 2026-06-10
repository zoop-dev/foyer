#!/usr/bin/env python3
"""
Foyer DB host — a tiny D1-compatible SQLite HTTP service.

Replaces Cloudflare D1 for Foyer sites: the Pages Functions talk to this over a
Cloudflare Tunnel instead of the D1 binding. One SQLite file per site, served
behind a bearer token. Pure stdlib (sqlite3 + http.server) — no pip installs.

Run:   DB_SECRET=... DATA_DIR=/home/pi/foyer-db python3 server.py
Env:
  DB_SECRET   (required)  bearer token the Workers must send
  DATA_DIR    (default ./data)  where <db>.db files live
  PORT        (default 8787)
  ALLOWED_DBS (optional)  comma list; if set, only these db names are allowed

Wire protocol (matches what functions/api/_lib/d1http.js sends):
  POST /query  {db, sql, params:[...], mode:'first'|'all'|'run'}
       -> {results:[...], meta:{last_row_id, changes, rows_read}, success:true}
  POST /batch  {db, statements:[{sql, params:[...]}]}
       -> {results:[ {results, meta, success}, ... ], success:true}   (one transaction)
  GET  /health -> {ok:true}
"""
import os, json, re, sqlite3, threading, hmac
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SECRET = os.environ.get("DB_SECRET", "")
DATA_DIR = os.environ.get("DATA_DIR", os.path.join(os.path.dirname(__file__), "data"))
PORT = int(os.environ.get("PORT", "8787"))
ALLOWED = set(x.strip() for x in os.environ.get("ALLOWED_DBS", "").split(",") if x.strip())
# WAL is best on ext4; on FAT/exFAT use DELETE (WAL's shared-memory files don't work there).
JOURNAL_MODE = os.environ.get("JOURNAL_MODE", "WAL").upper()
if JOURNAL_MODE not in ("WAL", "DELETE", "TRUNCATE", "PERSIST", "MEMORY", "OFF"):
    JOURNAL_MODE = "WAL"
DB_NAME_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")

os.makedirs(DATA_DIR, exist_ok=True)

# One connection + lock per db file (SQLite is single-writer; we serialize per db).
_conns, _locks, _glock = {}, {}, threading.Lock()

# Hardening: the endpoint runs arbitrary SQL, so deny ATTACH/DETACH — that's the only
# way a query could reach files outside its own db (e.g. ATTACH '/etc/...'). Extension
# loading is already off by default in Python's sqlite3. Everything else is allowed
# (Foyer legitimately needs full read/write DDL on its own db).
def _authorizer(action, a1, a2, a3, a4):
    if action in (sqlite3.SQLITE_ATTACH, sqlite3.SQLITE_DETACH):
        return sqlite3.SQLITE_DENY
    return sqlite3.SQLITE_OK

def get_db(name):
    if not DB_NAME_RE.match(name or "") or (ALLOWED and name not in ALLOWED):
        raise ValueError("bad or disallowed db name")
    with _glock:
        if name not in _conns:
            conn = sqlite3.connect(os.path.join(DATA_DIR, name + ".db"), check_same_thread=False)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA journal_mode=" + JOURNAL_MODE)
            conn.execute("PRAGMA busy_timeout=5000")
            conn.execute("PRAGMA foreign_keys=ON")
            conn.set_authorizer(_authorizer)   # after setup pragmas, before any user SQL
            _conns[name], _locks[name] = conn, threading.Lock()
        return _conns[name], _locks[name]

def run_one(cur, sql, params):
    cur.execute(sql, list(params or []))
    rows = [dict(r) for r in cur.fetchall()] if cur.description is not None else []
    return {
        "results": rows,
        "meta": {"last_row_id": cur.lastrowid, "changes": cur.rowcount if cur.rowcount != -1 else 0, "rows_read": len(rows)},
        "success": True,
    }

def do_query(body):
    conn, lock = get_db(body.get("db"))
    sql, params = body["sql"], body.get("params", [])
    with lock:
        cur = conn.cursor()
        try:
            out = run_one(cur, sql, params)
            conn.commit()
            return out
        finally:
            cur.close()

def do_batch(body):
    conn, lock = get_db(body.get("db"))
    stmts = body.get("statements", [])
    with lock:
        cur = conn.cursor()
        try:
            cur.execute("BEGIN")
            results = [run_one(cur, s["sql"], s.get("params", [])) for s in stmts]
            conn.commit()
            return {"results": results, "success": True}
        except Exception:
            conn.rollback()
            raise
        finally:
            cur.close()

class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    def log_message(self, *a): pass  # quiet

    def _send(self, code, obj):
        data = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _authed(self):
        h = self.headers.get("Authorization", "")
        tok = h[7:] if h.startswith("Bearer ") else ""
        return SECRET and hmac.compare_digest(tok, SECRET)

    def do_GET(self):
        if self.path == "/health":
            return self._send(200, {"ok": True})
        self._send(404, {"error": "not found"})

    def do_POST(self):
        if not self._authed():
            return self._send(401, {"error": "unauthorized"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = json.loads(self.rfile.read(length) or "{}")
        except Exception:
            return self._send(400, {"error": "bad json"})
        try:
            if self.path == "/query":
                return self._send(200, do_query(body))
            if self.path == "/batch":
                return self._send(200, do_batch(body))
            return self._send(404, {"error": "not found"})
        except ValueError as e:
            return self._send(400, {"error": str(e)})
        except sqlite3.Error as e:
            return self._send(400, {"error": "sqlite: " + str(e)})
        except Exception as e:
            return self._send(500, {"error": str(e)})

if __name__ == "__main__":
    if not SECRET:
        raise SystemExit("DB_SECRET env var is required")
    # Bind localhost ONLY — nothing on the LAN can reach this port; the sole path in is
    # the Cloudflare tunnel (cloudflared runs on this same host and connects to localhost).
    print(f"foyer-db on 127.0.0.1:{PORT}  data={DATA_DIR}  dbs={'all' if not ALLOWED else ','.join(ALLOWED)}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
