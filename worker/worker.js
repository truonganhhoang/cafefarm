/* Cloudflare Worker: máy chủ AI trung gian cho Cà phê Tây Bắc 2.0.
   Giữ khoá API Anthropic ở phía máy chủ; trình duyệt chỉ gọi địa chỉ Worker.
   Biến môi trường: ANTHROPIC_API_KEY (secret), ALLOWED_ORIGINS (vd https://truonganhhoang.github.io), MODEL (tuỳ chọn). */
export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
    const ok = allowed.length === 0 || allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": ok && origin ? origin : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Vary": "Origin"
    };
    const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { ...cors, "content-type": "application/json" } });
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST" || !ok) return json({ error: "forbidden" }, 403);

    let body;
    try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
    const msgs = (Array.isArray(body.messages) ? body.messages : []).slice(-12).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 8000)
    }));
    if (!msgs.length || msgs[msgs.length - 1].role !== "user") return json({ error: "no_message" }, 400);

    const imgs = (Array.isArray(body.images) ? body.images : []).slice(0, 1)
      .filter(i => /^image\/(jpeg|png|webp)$/.test(i.media_type) && typeof i.data === "string" && i.data.length < 2_000_000);
    if (imgs.length) {
      const last = msgs[msgs.length - 1];
      last.content = [
        ...imgs.map(i => ({ type: "image", source: { type: "base64", media_type: i.media_type, data: i.data } })),
        { type: "text", text: last.content }
      ];
    }

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: env.MODEL || "claude-sonnet-5-5", max_tokens: 1200, messages: msgs })
    });
    if (!r.ok) return json({ error: "upstream_" + r.status }, r.status === 429 ? 429 : 502);
    const j = await r.json();
    const text = (j.content || []).filter(c => c.type === "text").map(c => c.text).join("");
    return json({ text });
  }
};
