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


const NEWS_IMAGE_HOSTS = [
  "antaranews.com", "detik.com", "okezone.com", "kompas.com",
  "bbc.com", "bbc.co.uk", "theguardian.com", "skysports.com",
  "espn.com", "news.google.com", "pssi.org"
];
function allowedNewsUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && (!u.port || u.port === "443") &&
      !u.username && !u.password &&
      NEWS_IMAGE_HOSTS.some(host => u.hostname === host || u.hostname.endsWith("." + host));
  } catch { return false; }
}
function imageFromHtml(html, pageUrl) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const candidates = [];
  for (const tag of tags) {
    const attrs = {};
    tag.replace(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g,
      (_, key, a, b, c) => { attrs[key.toLowerCase()] = a ?? b ?? c ?? ""; return ""; });
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (["og:image", "og:image:url", "twitter:image", "twitter:image:src"].includes(key) && attrs.content) {
      candidates.push(attrs.content.replace(/&amp;/g, "&").replace(/&#0?39;/g, "'").replace(/&quot;/g, '"'));
    }
  }
  for (const value of candidates) {
    try {
      const u = new URL(value, pageUrl);
      if (u.protocol === "https:" && !/(?:1x1|pixel|spacer|favicon|tracking)/i.test(u.href)) return u.href;
    } catch {}
  }
  return "";
}
async function resolveNewsImage(request, ctx, origin) {
  const raw = new URL(request.url).searchParams.get("url") || "";
  if (!allowedNewsUrl(raw)) return json({ error: "URL sumber tidak termasuk daftar penerbit yang diizinkan." }, 400, origin);
  const cache = caches.default;
  const cacheKey = new Request("https://mailnews-image-cache.invalid/?url=" + encodeURIComponent(raw), { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) {
    const headers = new Headers(cached.headers);
    Object.entries(corsHeaders(origin)).forEach(([k, v]) => headers.set(k, v));
    headers.set("X-Mailnews-Cache", "HIT");
    return new Response(cached.body, { status: cached.status, headers });
  }
  try {
    let current = raw, response = null;
    for (let hop = 0; hop <= 3; hop++) {
      if (!allowedNewsUrl(current)) return json({ error: "Redirect sumber tidak diizinkan." }, 400, origin);
      response = await fetch(current, {
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Mailnews/1.0)", "Accept": "text/html,application/xhtml+xml" },
        signal: AbortSignal.timeout(7000)
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("Location");
        if (!location || hop === 3) break;
        current = new URL(location, current).href;
        continue;
      }
      break;
    }
    if (!response || !response.ok || !/text\/html|application\/xhtml\+xml/i.test(response.headers.get("Content-Type") || "")) {
      return json({ image: "", reason: "Halaman penerbit tidak menyediakan HTML yang dapat dibaca." }, 200, origin, { "Cache-Control": "public, max-age=0, s-maxage=21600" });
    }
    const html = (await response.text()).slice(0, 1500000);
    const image = imageFromHtml(html, current);
    const result = json({ image, page: current, provider: "metadata halaman penerbit" }, 200, origin, { "Cache-Control": "public, max-age=0, s-maxage=86400" });
    ctx.waitUntil(cache.put(cacheKey, result.clone()));
    return result;
  } catch {
    return json({ image: "", reason: "Gambar belum dapat diambil dari halaman penerbit." }, 200, origin, { "Cache-Control": "public, max-age=0, s-maxage=21600" });
  }
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
    const path = "/" + url.pathname.split("/").filter(Boolean).join("/");

    if (path === "/news-image") return resolveNewsImage(request, ctx, origin);

    // Official AFC fallback for Indonesian domestic league standings.
    // This route is independent of the API-Football subscription/key.
    if (path === "/afc/indonesia-standings" || path === "/afc/indonesia-fixtures") {
      try {
        const upstream = await fetch("https://www.the-afc.com/en/livescores/asian_leagues/association/MA03", {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; Mailnews/1.0)", "Accept": "text/html" },
          cf: { cacheTtl: path.endsWith("fixtures") ? 180 : 300, cacheEverything: true }
        });
        if (!upstream.ok) return json({ error: "AFC menolak permintaan.", providerStatus: upstream.status }, upstream.status, origin);
        return new Response(await upstream.text(), {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=" + (path.endsWith("fixtures") ? 180 : 300),
            "X-Mailnews-Provider": "AFC",
            ...corsHeaders(origin)
          }
        });
      } catch (error) {
        return json({ error: "Tidak dapat mengambil data AFC.", details: String(error) }, 502, origin);
      }
    }

    if (!env.APIFOOTBALL_KEY) {
      return json({ error: "API key belum dikonfigurasi di Worker secret APIFOOTBALL_KEY." }, 503, origin);
    }
    const params = new URLSearchParams();
    const bypassCache = url.searchParams.get("refresh") === "1";
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
      cacheSeconds = 300;
    } else if (path === "/match") {
      const fixture = url.searchParams.get("fixture");
      if (!/^\d{1,12}$/.test(fixture || "")) {
        return json({ error: "Parameter fixture (ID pertandingan numerik) wajib." }, 400, origin);
      }
      params.set("fixture", fixture);
      cacheSeconds = 20;
    } else if (path === "/players") {
      const search = (url.searchParams.get("search") || "").trim();
      const season = url.searchParams.get("season");
      if (search.length < 3 || search.length > 60 || !/^\d{4}$/.test(season || "")) {
        return json({ error: "search (3–60 karakter) dan season (YYYY) wajib." }, 400, origin);
      }
      params.set("search", search);
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
    const cached = bypassCache ? null : await cache.match(cacheKey);
    if (cached) {
      const headers = new Headers(cached.headers);
      Object.entries(corsHeaders(origin)).forEach(([k, v]) => headers.set(k, v));
      headers.set("X-Mailnews-Cache", "HIT");
      return new Response(cached.body, { status: cached.status, headers });
    }

    try {
      const upstream = await fetch(target, {
        headers: { "x-apisports-key": env.APIFOOTBALL_KEY },
        cf: bypassCache ? { cacheTtl: 0, cacheEverything: false } : { cacheTtl: cacheSeconds, cacheEverything: true }
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
      if (!bypassCache) ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch (error) {
      return json({ error: "Tidak dapat terhubung ke penyedia data.", details: String(error) }, 502, origin);
    }
  }
};
