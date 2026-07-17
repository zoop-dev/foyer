export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  url.pathname = "/";
  const indexReq = new Request(url.toString(), request);
  return env.ASSETS.fetch(indexReq);
}
