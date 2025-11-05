import querystring from "querystring";
import axios from "axios";
import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

import sotdRouter from "./api/sotd.js";
import pool from "./database.js";

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to PostgreSQL:", res.rows[0].now);
  }
});

dotenv.config();

const app = express();
// app.use(cors({ origin: "https://moodsic-three.vercel.app" }));
// const allowedOrigins = [
//   "https://moodsic-three.vercel.app" 
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("CORS not allowed for this origin"));
//     }
//   },
//   methods: ["GET", "POST", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// }));

const corsOptions = {
  origin: "https://moodsic-three.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI;

// --- LOGIN STEP ---
app.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private';
  const params = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope,
  });
  res.redirect('https://accounts.spotify.com/authorize?' + params);
});

// --- CALLBACK STEP ---
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const error = req.query.error || null;

  //User pressed "Cancel" on Spotify authorization
  if (error === 'access_denied') {
    console.log("User denied access — redirecting to login page");
    return res.redirect(`${FRONTEND_URI}/?error=access_denied`);
  }

  //Normal case: got authorization code
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify({
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();
    console.log("Spotify token exchange:", data);

    if (data.access_token) {
      const params = querystring.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      return res.redirect(`${FRONTEND_URI}/?${params}`);
    } else {
      console.error("Token exchange failed:", data);
      return res.redirect(`${FRONTEND_URI}/?error=token_failed`);
    }
  } catch (err) {
    console.error("Error during token exchange:", err);
    return res.redirect(`${FRONTEND_URI}/?error=server_error`);
  }
});


// --- REFRESH TOKEN ENDPOINT ---
app.get('/refresh_token', async (req, res) => {
  const refresh_token = req.query.refresh_token;
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });

  const data = await response.json();
  res.json(data);
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// -------------------- Generate Playlist --------------------
app.post("/generatePlaylist", async (req, res) => {
  try {
    const {
      mood = "",
      selectedWords = [],
      weather = null,
      personalityVector = {},
      spotifyGenres = [],
      spotifyTopArtists = [],
      accessToken
    } = req.body;

    // ----- Generate vibe phrase with Gemini AI -----
    const aiPrompt = `
Create a vibe phrase for a playlist. Use the following inputs:
Mood: ${mood || "N/A"}
Selected Words: ${selectedWords.length ? selectedWords.join(", ") : "N/A"}
Weather: ${weather?.temp ? `${weather.temp}°C, ${weather.description}` : "N/A"}
Personality vector: ${Object.keys(personalityVector).length ? JSON.stringify(personalityVector) : "N/A"}
Spotify Genres: ${spotifyGenres.length ? spotifyGenres.join(", ") : "N/A"}
Spotify Top Artists: ${spotifyTopArtists.length ? spotifyTopArtists.join(", ") : "N/A"}
Limit vibe phrase to 10 words max. Do not use words from the input directly.
`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: aiPrompt,
      temperature: 0.7,
      maxOutputTokens: 128
    });

    const vibePhrase = aiResponse.text?.trim() || "Chill Vibes";
    console.log("AI generated vibe phrase:", vibePhrase);

    // ----- Search Spotify tracks safely -----
    let tracks = [];

    if (accessToken) {
      try {
        const searchResponse = await axios.get(
          `https://api.spotify.com/v1/search`,
          {
            params: { q: vibePhrase, type: "track", limit: 15 },
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: 15000,
          }
        );

        tracks = (searchResponse.data.tracks?.items || []).map(track => ({
          name: track.name,
          artist: track.artists.map(a => a.name).join(", "),
          url: track.external_urls.spotify,
          image: track.album.images[0]?.url || ""
        }));

        console.log("Spotify tracks found:", tracks.length);

      } catch (spotifyErr) {
        // Handle development mode / unregistered users gracefully
        console.warn(
          "Spotify track search failed (maybe Free account or not allowlisted).",
          spotifyErr.response?.status,
          spotifyErr.response?.data?.error?.message
        );
        tracks = []; // fallback to empty tracks
      }
    }

    // ----- Return results -----
    res.json({ vibePhrase, tracks });

  } catch (err) {
    console.error("Error generating playlist:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Failed to generate playlist" });
  }
});


// --- WEATHER DATA ENDPOINT ---
app.get("/weather", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude required" });
  }

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat,
          lon,
          appid: process.env.WEATHER_API_KEY,
          units: "metric",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

app.use("/api", sotdRouter);

app.post("/save-session", async (req, res) => {
  try {
    const { email, name, mood, selected_words, songs } = req.body;

    const result = await pool.query(
      `INSERT INTO sessions (email, name, mood, selected_words, songs)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email, name, mood, selected_words, JSON.stringify(songs)]
    );

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error saving session:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// server.js (add after /save-session)
app.post("/get-session", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ success: false, error: "Email required" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM sessions WHERE email = $1 ORDER BY timestamp DESC LIMIT 1`,
      [email]
    );

    if (!result || result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    // Postgres error code for "relation does not exist" is 42P01
    if (err && err.code === "42P01") {
      console.error("DB error (table missing):", err);
      return res.status(500).json({
        success: false,
        error:
          "Database table 'sessions' not found. Have you run migrations or created the table?",
      });
    }

    // Generic fallback — do NOT leak full error details to clients in production
    console.error("Error fetching session:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch session. Check server logs for details.",
    });
  }
});

// --- CLEAR SESSION (delete saved playlists for user) ---
app.post("/clear-session", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  try {
    await pool.query("DELETE FROM sessions WHERE email = $1", [email]);
    return res.json({ success: true });
  } catch (err) {
    console.error("Error clearing sessions:", err);
    return res.status(500).json({ success: false, error: "Failed to clear sessions" });
  }
});

// --- MOOD DATA ENDPOINT ---
app.post("/get-mood-data", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ success: false, error: "Email required" });
  }

  try {
    const result = await pool.query(
      `SELECT selected_words FROM sessions WHERE email = $1`,
      [email]
    );

    if (!result.rows.length) {
      return res.json({ success: true, data: [] });
    }

    // Flatten all selected_words across sessions
    const wordCount = {};

    for (const row of result.rows) {
      if (row.selected_words) {
        let words = [];

        try {
          // Parse JSON safely
          words = JSON.parse(row.selected_words);
        } catch (err) {
          console.warn("Invalid JSON in selected_words:", row.selected_words);
          continue;
        }

        // Count frequency
        words.forEach((w) => {
          const word = w.trim().toLowerCase();
          if (word) {
            wordCount[word] = (wordCount[word] || 0) + 1;
          }
        });
      }
    }

    // Convert to array and sort by frequency
    const sorted = Object.entries(wordCount)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // top 10

    return res.json({ success: true, data: sorted });
  } catch (err) {
    console.error("Error fetching mood data:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch mood data" });
  }
});



// 404 handler comes after all other routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.path });
});

//  run the server locally
if (process.env.NODE_ENV !== "production") {
  const PORT = 8888;
  app.listen(PORT, () =>
    console.log(`✅ Backend running locally on https://moodsic-backend/callback.vercel.app:${PORT}`)
  );
}

// export the app for Vercel serverless usage
export default app;
