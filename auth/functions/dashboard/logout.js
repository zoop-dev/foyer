import { opsClear } from "../_lib.js";
export async function onRequestGet() {
  return new Response(null, {
    status: 302,
    headers: { location: "/dashboard", "set-cookie": opsClear() },
  });
}
