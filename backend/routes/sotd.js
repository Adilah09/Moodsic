import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

let cached = null;
let cachedDate = null;

// ---- tiny fetch with timeout helper ----
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

function isToday(date) {
  const today = new Date();
  return (
    date &&
    date.getUTCFullYear() === today.getUTCFullYear() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCDate() === today.getUTCDate()
  );
}

// async function getSpotifyToken() {
//   const res = await fetch("https://accounts.spotify.com/api/token", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//       Authorization:
//         "Basic " +
//         Buffer.from(
//           `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
//         ).toString("base64"),
//     },
//     body: "grant_type=client_credentials",
//   });

//   const data = await res.json();
//   if (!res.ok) throw new Error("Spotify token failed");
//   return data.access_token;
// }

async function getSpotifyToken() {
  console.log("[SOTD] requesting client-credentials token...");
  const res = await fetchWithTimeout("https://accounts.spotify.com/api/token", {
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
  }, 6000);

  const data = await res.json().catch(() => ({}));
  console.log("[SOTD] token status:", res.status, data?.error || "ok");
  if (!res.ok || !data.access_token) throw new Error("Spotify token failed");
  return data.access_token;
}

async function fetchSongOfTheDay() {
  const token = await getSpotifyToken();

  console.log("[SOTD] fetching random pop track with search...");
  // Search for a keyword that always returns results
  const query = encodeURIComponent("pop");
  const res = await fetchWithTimeout(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=50&market=US`,
    { headers: { Authorization: `Bearer ${token}` } },
    6000
  );

  const json = await res.json().catch(() => ({}));
  console.log("[SOTD] search status:", res.status, "tracks:", json.tracks?.items?.length);

  if (!json.tracks?.items?.length) throw new Error("No tracks returned from search");

  // Pick a stable "song of the day" based on date
  const today = new Date();
  const key = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const track = json.tracks.items[hash % json.tracks.items.length];

  return {
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    albumArt: track.album.images?.[0]?.url || "",
    link: track.external_urls.spotify,
    preview: track.preview_url || null,
  };
}

router.get("/api/sotd", async (_req, res) => {
  console.log("[SOTD] HIT /api/sotd");
  try {
    const song = await fetchSongOfTheDay();
    return res.json(song);
  } catch (e) {
    console.error("SOTD route error:", e.message);

    // Always return *something* so your frontend never hangs
    return res.status(200).json({
      title: "Daylight",
      artist: "David Kushner",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273a6b8ef0e0e1f7a69c6a25f5a",
      link: "https://open.spotify.com/track/6tHWpPEyn8l5IPeZFZ8Y8m",
      preview: null,
      note: "Fallback song because Spotify fetch failed",
    });
  }
});

export default router;
