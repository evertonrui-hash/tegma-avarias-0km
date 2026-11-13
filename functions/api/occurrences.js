const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json; charset=utf-8" }
});
const fail = (message, status = 400) => json({ error: message }, status);
const MAX_FILE = 10 * 1024 * 1024;
const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export async function onRequest({ request, env, params }) {
  if (!env.DB || !env.PHOTOS) return fail("Bindings DB (D1) e PHOTOS (R2) não configurados.", 500);
  const method = request.method.toUpperCase();
  if (method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT payload FROM occurrences ORDER BY occurrence_date DESC, created_at DESC"
    ).all();
    return json((results || []).map(row => JSON.parse(row.payload)));
  }
  if (method === "POST") {
    const form = await request.formData();
    let record;
    try { record = JSON.parse(form.get("record") || ""); } catch { return fail("Campo record inválido."); }
    if (!record?.id || !record?.data || !record?.chassi) return fail("Dados obrigatórios ausentes.");
    record.photos = {};
    for (const field of ["foto1", "foto2", "foto3"]) {
      const file = form.get(field);
      if (!file || typeof file === "string" || file.size === 0) continue;
      if (file.size > MAX_FILE) return fail(`${field}: arquivo excede 10 MB.`);
      if (!allowed.has(file.type)) return fail(`${field}: formato não permitido. Use JPG, PNG ou WEBP.`);
      const key = `${record.id}-${field}-${crypto.randomUUID()}`;
      await env.PHOTOS.put(key, file.stream(), {
        httpMetadata: { contentType: file.type },
        customMetadata: { occurrenceId: record.id, field }
      });
      record.photos[field] = `/api/photos/${encodeURIComponent(key)}`;
    }
    const now = new Date().toISOString();
    await env.DB.prepare(
      "INSERT INTO occurrences (id, occurrence_date, status, payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(record.id, record.data, record.status || "Nova", JSON.stringify(record), now, now).run();
    return json(record, 201);
  }
  return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, POST, PUT" } });
}
