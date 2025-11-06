import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// ---- Helper: fetch with timeout ----
async function fetchWithTimeout(url, opts = {}, ms = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// ---- Spotify client credentials ----
async function getSpotifyToken() {
  console.log("[SOTD] requesting client-credentials token...");
  const res = await fetchWithTimeout(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64"),
      },
      body: "grant_type=client_credentials",
    },
    6000
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error("Spotify token failed");
  return data.access_token;
}

// ---- Song of the Day logic ----
async function fetchSongOfTheDay() {
  const token = await getSpotifyToken();

  console.log("[SOTD] fetching random pop track with search...");
  const query = encodeURIComponent("pop");
  const res = await fetchWithTimeout(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=50&market=US`,
    { headers: { Authorization: `Bearer ${token}` } },
    6000
  );

  const json = await res.json().catch(() => ({}));
  if (!json.tracks?.items?.length) throw new Error("No tracks returned");

  // Prefer tracks with preview URLs
  const tracksWithPreview = json.tracks.items.filter((t) => t.preview_url);
  const candidates = tracksWithPreview.length
    ? tracksWithPreview
    : json.tracks.items;

  // Deterministic selection based on date
  const today = new Date();
  const key = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;

  const track = candidates[hash % candidates.length];

  console.log("[SOTD] selected:", track.name, "preview:", !!track.preview_url);

  return {
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    albumArt: track.album.images?.[0]?.url || "",
    link: track.external_urls.spotify,
    preview: track.preview_url || null,
  };
}

// ---- Main handler (Vercel entrypoint) ----
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  console.log("[SOTD] HIT /api/sotd");
  try {
    const song = await fetchSongOfTheDay();
    return res.status(200).json(song);
  } catch (e) {
    console.error("SOTD route error:", e.message);
    // Fallback response
    return res.status(200).json({
      title: "Daylight",
      artist: "David Kushner",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273a6b8ef0e0e1f7a69c6a25f5a",
      link: "https://open.spotify.com/track/6tHWpPEyn8l5IPeZFZ8Y8m",
      preview: null,
      note: "Fallback song (Spotify fetch failed)",
    });
  }
}
