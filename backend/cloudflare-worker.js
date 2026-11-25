const API_BASE = "https://v3.football.api-sports.io";
const ALLOWED_ORIGINS = new Set([
  "https://hurahurafestival.github.io",
  "http://localhost:8788"
]);

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://hurahurafestival.github.io";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(data, status, origin, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(origin),
      ...extra
    }
  });
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "") &&
    !Number.isNaN(Date.parse(value + "T00:00:00Z"));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405, origin);
    }
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return json({ error: "Origin not allowed" }, 403, origin);
    }
    if (!env.APIFOOTBALL_KEY) {
      return json({ error: "API key belum dikonfigurasi di Worker secret APIFOOTBALL_KEY." }, 503, origin);
    }

    const path = "/" + url.pathname.split("/").filter(Boolean).join("/");
    const params = new URLSearchParams();
    let cacheSeconds = 60;

    if (path === "/health") {
      return json({ status: "ok", provider: "API-Football", proxy: "mailnews" }, 200, origin);
    } else if (path === "/fixtures") {
      const live = url.searchParams.get("live");
      const id = url.searchParams.get("id");
      const date = url.searchParams.get("date");
      const league = url.searchParams.get("league");
      const season = url.searchParams.get("season");
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      if (live === "all") {
        params.set("live", "all");
        if (league && /^\d{1,6}$/.test(league)) params.set("league", league);
        cacheSeconds = 15;
      } else if (id && /^\d{1,12}$/.test(id)) {
        params.set("id", id);
        cacheSeconds = 30;
      } else if (validDate(from) && validDate(to) && league && /^\d{1,6}$/.test(league) && season && /^\d{4}$/.test(season)) {
        params.set("from", from);
        params.set("to", to);
        params.set("league", league);
        params.set("season", season);
        params.set("timezone", "Asia/Jakarta");
        cacheSeconds = 300;
      } else if (validDate(date)) {
        params.set("date", date);
        if (league && /^\d{1,6}$/.test(league)) params.set("league", league);
        params.set("timezone", "Asia/Jakarta");
        cacheSeconds = 60;
      } else {
        return json({ error: "Gunakan ?live=all&league=ID, ?id=ID, ?date=YYYY-MM-DD, atau ?from=YYYY-MM-DD&to=YYYY-MM-DD&league=ID&season=YYYY." }, 400, origin);
      }
    } else if (path === "/standings") {
      const league = url.searchParams.get("league");
      const season = url.searchParams.get("season");
      if (!/^\d{1,6}$/.test(league || "") || !/^\d{4}$/.test(season || "")) {
        return json({ error: "Parameter league (ID numerik) dan season (YYYY) wajib." }, 400, origin);
      }
      params.set("league", league);
      params.set("season", season);
      cacheSeconds = 3600;
    } else if (path === "/leagues") {
      const search = (url.searchParams.get("search") || "").trim();
      if (search.length < 3 || search.length > 60) {
        return json({ error: "search harus berisi 3–60 karakter." }, 400, origin);
      }
      params.set("search", search);
      cacheSeconds = 3600;
    } else {
      return json({ error: "Endpoint tidak ditemukan." }, 404, origin);
    }

    const target = API_BASE + path + "?" + params.toString();
    const cacheKey = new Request(target, { method: "GET" });
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) {
      const headers = new Headers(cached.headers);
      Object.entries(corsHeaders(origin)).forEach(([k, v]) => headers.set(k, v));
      headers.set("X-Mailnews-Cache", "HIT");
      return new Response(cached.body, { status: cached.status, headers });
    }

    try {
      const upstream = await fetch(target, {
        headers: { "x-apisports-key": env.APIFOOTBALL_KEY },
        cf: { cacheTtl: cacheSeconds, cacheEverything: true }
      });
      const body = await upstream.text();
      let parsed;
      try { parsed = JSON.parse(body); } catch { parsed = { error: "Respons penyedia bukan JSON." }; }
      if (!upstream.ok) {
        return json({
          error: "Penyedia data menolak permintaan.",
          providerStatus: upstream.status,
          details: parsed
        }, upstream.status, origin);
      }
      const headers = new Headers({
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=" + cacheSeconds,
        "X-Mailnews-Provider": "API-Football",
        ...corsHeaders(origin)
      });
      const response = new Response(JSON.stringify(parsed), { status: 200, headers });
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch (error) {
      return json({ error: "Tidak dapat terhubung ke penyedia data.", details: String(error) }, 502, origin);
    }
  }
};
