const enc = new TextEncoder();
export function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
export function bytesToB64url(bytes) {
  bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function concat(...arrs) {
  let len = 0;
  for (const a of arrs) len += a.length;
  const out = new Uint8Array(len);
  let o = 0;
  for (const a of arrs) {
    out.set(a, o);
    o += a.length;
  }
  return out;
}
async function importVapidSigningKey(publicB64url, privateD) {
  const pub = b64urlToBytes(publicB64url);
  const x = bytesToB64url(pub.slice(1, 33));
  const y = bytesToB64url(pub.slice(33, 65));
  return crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x, y, d: privateD, ext: true, key_ops: ["sign"] },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
}
async function vapidAuthHeader(endpoint, publicB64url, privateD, subject) {
  const aud = new URL(endpoint).origin;
  const header = bytesToB64url(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const body = bytesToB64url(
    enc.encode(
      JSON.stringify({
        aud,
        exp: Math.floor(Date.now() / 1e3) + 12 * 3600,
        sub: subject || "mailto:admin@foyer.zo0p.dev"
      })
    )
  );
  const signingInput = `${header}.${body}`;
  const key = await importVapidSigningKey(publicB64url, privateD);
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    enc.encode(signingInput)
  );
  const jwt = `${signingInput}.${bytesToB64url(new Uint8Array(sig))}`;
  return `vapid t=${jwt}, k=${publicB64url}`;
}
async function hkdf(salt, ikm, info, len) {
  const base = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info },
    base,
    len * 8
  );
  return new Uint8Array(bits);
}
async function encryptPayload(plaintext, uaPublicB64url, authB64url) {
  const uaPublic = b64urlToBytes(uaPublicB64url);
  const authSecret = b64urlToBytes(authB64url);
  const data = enc.encode(plaintext);
  const eph = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
    "deriveBits"
  ]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", eph.publicKey));
  const uaKey = await crypto.subtle.importKey(
    "raw",
    uaPublic,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
  const ecdhBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: uaKey },
    eph.privateKey,
    256
  );
  const ecdhSecret = new Uint8Array(ecdhBits);
  const keyInfo = concat(enc.encode("WebPush: info\0"), uaPublic, asPublic);
  const ikm = await hkdf(authSecret, ecdhSecret, keyInfo, 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const padded = concat(data, new Uint8Array([2]));
  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, padded)
  );
  const rs = new Uint8Array([0, 0, 16, 0]);
  const idlen = new Uint8Array([asPublic.length]);
  return concat(salt, rs, idlen, asPublic, ct);
}
export async function sendWebPush(subscription, payloadString, opts) {
  const body = await encryptPayload(
    payloadString,
    subscription.keys.p256dh,
    subscription.keys.auth
  );
  const auth = await vapidAuthHeader(
    subscription.endpoint,
    opts.vapidPublic,
    opts.vapidPrivate,
    opts.subject
  );
  const res = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: String(opts.ttl || 2419200),
      ...opts.urgency ? { Urgency: opts.urgency } : {}
    },
    body
  });
  return {
    ok: res.status >= 200 && res.status < 300,
    status: res.status,
    gone: res.status === 404 || res.status === 410
  };
}
