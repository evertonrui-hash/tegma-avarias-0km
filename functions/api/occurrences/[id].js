const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json; charset=utf-8" }
});
export async function onRequest({ request, env, params }) {
  if (request.method !== "PUT") return new Response("Method Not Allowed", { status: 405, headers: { Allow: "PUT" } });
  if (!env.DB) return json({ error: "Binding D1 DB não configurado." }, 500);
  let record;
  try { record = await request.json(); } catch { return json({ error: "JSON inválido." }, 400); }
  if (!record?.id || record.id !== params.id) return json({ error: "Identificador inválido." }, 400);
  const now = new Date().toISOString();
  const result = await env.DB.prepare(
    "UPDATE occurrences SET occurrence_date = ?, status = ?, payload = ?, updated_at = ? WHERE id = ?"
  ).bind(record.data || "", record.status || "Nova", JSON.stringify(record), now, record.id).run();
  if (!result.meta?.changes) return json({ error: "Ocorrência não encontrada." }, 404);
  return json({ ok: true, id: record.id });
}
