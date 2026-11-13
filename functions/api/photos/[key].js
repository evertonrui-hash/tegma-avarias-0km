export async function onRequest({ env, params }) {
  if (!env.PHOTOS) return new Response("Binding R2 PHOTOS não configurado.", { status: 500 });
  const key = params.key;
  if (!key || key.includes("..")) return new Response("Not Found", { status: 404 });
  const object = await env.PHOTOS.get(key);
  if (!object) return new Response("Not Found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "private, max-age=3600");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
}
