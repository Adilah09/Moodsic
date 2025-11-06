// -------------------- IMPORTS --------------------
import querystring from "querystring";
import axios from "axios";
import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import sotdRouter from "./api/sotd.js";
import pool from "./database.js";

// -------------------- DATABASE CONNECTION --------------------
pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("Database connection failed:", err);
  else console.log("Connected to PostgreSQL:", res.rows[0].now);
});

dotenv.config();

// -------------------- EXPRESS APP SETUP --------------------
const app = express();

const corsOptions = {
  origin: "https://moodsic-three.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// -------------------- SPOTIFY AUTH --------------------
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI;

// --- LOGIN STEP ---
app.get("/login", (req, res) => {
  const scope =
    "user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private";
  const params = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope,
  });
  res.redirect("https://accounts.spotify.com/authorize?" + params);
});

// --- CALLBACK STEP ---
app.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  const error = req.query.error || null;

  if (error === "access_denied") {
    console.log("User denied access — redirecting to login page");
    return res.redirect(`${FRONTEND_URI}/?error=access_denied`);
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: querystring.stringify({
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
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
app.get("/refresh_token", async (req, res) => {
  const refresh_token = req.query.refresh_token;
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: querystring.stringify({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });

  const data = await response.json();
  res.json(data);
});

// -------------------- GEMINI AI SETUP --------------------
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ---- Generate words for WordVinyl ----
let allWords = [];
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const wordPrompt = `
Generate 22 unique adjectives and emotive words (positive and negative):
- 5 words that must be 6 letters or less
- 7 words that must be 7 letters or less
- 10 words that must be 8 letters or less
Return only JSON like this:
{ "words": ["calm", "bright", "vivid", ...] }
`;

const systemInstruction = `
You are a word list generator. Always respond with a valid JSON object 
containing an array of adjectives under the key "words".
`;

const responseSchema = {
  type: "object",
  properties: {
    words: { type: "array", items: { type: "string" } },
  },
  required: ["words"],
};

const model = gemini.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  systemInstruction,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema,
  },
});

// --- WORD ENDPOINTS ---
app.post("/generate-words", async (req, res) => {
  console.log("🧠 Received request to /generate-words...");
  try {
    const result = await model.generateContent(wordPrompt);
    const jsonText = result.response.text();
    console.log("🔹 Raw Gemini response:", jsonText);

    const parsed = JSON.parse(jsonText);
    if (parsed.words && Array.isArray(parsed.words)) {
      allWords = parsed.words;
      console.log(`✅ Stored ${allWords.length} generated words.`);
      return res.status(200).json({ allWords });
    }

    throw new Error("Gemini response did not include a valid 'words' array.");
  } catch (error) {
    console.error("❌ Error in /generate-words:", error);
    res.status(500).json({
      error: "Failed to generate word list.",
      details: error.message || error,
    });
  }
});

app.get("/get-words", (req, res) => {
  if (!allWords.length) {
    console.log("ℹ️ No words generated yet.");
    return res.status(200).json({
      allWords: [],
      message: "No words generated yet. Call POST /generate-words first.",
    });
  }
  console.log(`📤 Sending ${allWords.length} stored words.`);
  res.status(200).json({ allWords });
});

// -------------------- PLAYLIST GENERATION --------------------
app.post("/generatePlaylist", async (req, res) => {
  try {
    const {
      mood = "",
      selectedWords = [],
      weather = null,
      personalityVector = {},
      spotifyGenres = [],
      spotifyTopArtists = [],
      accessToken,
    } = req.body;

    const aiPrompt = `
Create a vibe phrase for a playlist. Use the following inputs:
Mood: ${mood || "N/A"}
Selected Words: ${
      selectedWords.length ? selectedWords.join(", ") : "N/A"
    }
Weather: ${
      weather?.temp ? `${weather.temp}°C, ${weather.description}` : "N/A"
    }
Personality vector: ${
      Object.keys(personalityVector).length
        ? JSON.stringify(personalityVector)
        : "N/A"
    }
Spotify Genres: ${spotifyGenres.length ? spotifyGenres.join(", ") : "N/A"}
Spotify Top Artists: ${
      spotifyTopArtists.length ? spotifyTopArtists.join(", ") : "N/A"
    }
Limit vibe phrase to 10 words max. Do not use words from the input directly.
`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: aiPrompt,
      temperature: 0.7,
      maxOutputTokens: 128,
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

        tracks = (searchResponse.data.tracks?.items || []).map((track) => ({
          name: track.name,
          artist: track.artists.map((a) => a.name).join(", "),
          url: track.external_urls.spotify,
          image: track.album.images[0]?.url || "",
        }));

        console.log("Spotify tracks found:", tracks.length);
      } catch (spotifyErr) {
        console.warn(
          "Spotify track search failed (maybe Free account or not allowlisted).",
          spotifyErr.response?.status,
          spotifyErr.response?.data?.error?.message
        );
        tracks = [];
      }
    }

    res.json({ vibePhrase, tracks });
  } catch (err) {
    console.error(
      "Error generating playlist:",
      err.response?.data || err.message || err
    );
    res.status(500).json({ error: "Failed to generate playlist" });
  }
});

// -------------------- WEATHER DATA ENDPOINT --------------------
app.get("/weather", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon)
    return res.status(400).json({ error: "Latitude and longitude required" });

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: { lat, lon, appid: process.env.WEATHER_API_KEY, units: "metric" },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

// -------------------- DATABASE ROUTES --------------------
app.use("/api", sotdRouter);

// --- SAVE SESSION ---
app.post("/save-session", async (req, res) => {
  try {
    const { email, name, mood, selected_words, songs } = req.body;

    // Normalize selected_words to a JS array for Postgres text[] columns
    let selectedWordsArray = [];
    if (Array.isArray(selected_words)) {
      selectedWordsArray = selected_words;
    } else if (typeof selected_words === "string" && selected_words.trim()) {
      try {
        const parsed = JSON.parse(selected_words);
        if (Array.isArray(parsed)) selectedWordsArray = parsed;
        else selectedWordsArray = [selected_words];
      } catch {
        // Fallback: treat as comma-separated or single token
        selectedWordsArray = selected_words
          .split(",")
          .map((w) => w.trim())
          .filter(Boolean);
      }
    }

    const result = await pool.query(
      `INSERT INTO sessions (email, name, mood, selected_words, songs)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email, name, mood, selectedWordsArray, JSON.stringify(songs)]
    );

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error saving session:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- SAVE PERSONALITY ---
app.post("/save-personality", async (req, res) => {
  try {
    const { email, name, personality_type } = req.body;
    if (!email || !personality_type)
      return res
        .status(400)
        .json({ success: false, error: "Email and personality type required" });

    const result = await pool.query(
      `INSERT INTO sessions (email, name, personality_type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [email, name, personality_type]
    );

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error saving personality:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- GET LATEST PERSONALITY ---
app.get("/get-latest-personality", async (req, res) => {
  const { email } = req.query;
  if (!email)
    return res.status(400).json({ success: false, error: "Email required" });

  try {
    const result = await pool.query(
      `SELECT personality_type
       FROM sessions
       WHERE email = $1
       AND personality_type IS NOT NULL
       ORDER BY timestamp DESC
       LIMIT 1`,
      [email]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, personality_type: result.rows[0].personality_type });
    } else {
      res.json({ success: true, personality_type: null });
    }
  } catch (err) {
    console.error("Error fetching personality:", err);
    res.status(500).json({ success: false, error: "Failed to fetch personality" });
  }
});


// --- GET LATEST SESSION ---
app.post("/get-session", async (req, res) => {
  const { email } = req.body || {};
  if (!email)
    return res.status(400).json({ success: false, error: "Email required" });

  try {
    const result = await pool.query(
      `SELECT * FROM sessions WHERE email = $1 ORDER BY timestamp DESC LIMIT 1`,
      [email]
    );

    if (!result || result.rows.length === 0)
      return res.json({ success: true, data: null });

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error fetching session:", err);
    res.status(500).json({ success: false, error: "Failed to fetch session" });
  }
});

// --- GET ALL SESSIONS FOR USER ---
app.post("/get-sessions", async (req, res) => {
  const { email } = req.body || {};
  if (!email)
    return res.status(400).json({ success: false, error: "Email required" });

  try {
    const result = await pool.query(
      `SELECT * FROM sessions WHERE email = $1 ORDER BY timestamp DESC`,
      [email]
    );

    return res.json({ success: true, data: result.rows || [] });
  } catch (err) {
    console.error("Error fetching sessions:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch sessions" });
  }
});

// --- CLEAR SESSION ---
app.post("/clear-session", async (req, res) => {
  const { email } = req.body || {};
  if (!email)
    return res.status(400).json({ success: false, error: "Email required" });

  try {
    await pool.query("DELETE FROM sessions WHERE email = $1", [email]);
    return res.json({ success: true });
  } catch (err) {
    console.error("Error clearing sessions:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to clear sessions" });
  }
});

// --- MOOD DATA ENDPOINT ---
app.post("/get-mood-data", async (req, res) => {
  const { email } = req.body || {};
  if (!email)
    return res.status(400).json({ success: false, error: "Email required" });

  try {
    const result = await pool.query(
      `SELECT selected_words FROM sessions WHERE email = $1`,
      [email]
    );

    if (!result.rows.length) return res.json({ success: true, data: [] });

    const wordCount = {};
    for (const row of result.rows) {
      if (!row.selected_words) continue;

      let words = [];
      const value = row.selected_words;

      if (Array.isArray(value)) {
        words = value;
      } else if (typeof value === "string") {
        // Try JSON first
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) words = parsed;
        } catch {
          // Try Postgres array string format: {mad,gloomy,"very sad"}
          const trimmed = value.trim();
          if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            const inner = trimmed.slice(1, -1);
            // Split respecting quotes
            const parts = inner.match(/(?:[^,"]+|"[^"]*")+/g) || [];
            words = parts.map((p) => p.replace(/^"|"$/g, "").trim());
          } else if (value.includes(",")) {
            words = value.split(",").map((w) => w.trim());
          } else if (value) {
            words = [value];
          }
        }
      }

      words.forEach((w) => {
        const word = String(w || "").trim().toLowerCase();
        if (word) wordCount[word] = (wordCount[word] || 0) + 1;
      });
    }

    const sorted = Object.entries(wordCount)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return res.json({ success: true, data: sorted });
  } catch (err) {
    console.error("Error fetching mood data:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch mood data" });
  }
});

// --- GET LATEST SELECTED WORDS (LIMIT 10) ---
app.post("/get-latest-words", async (req, res) => {
  const { email } = req.body || {};
  if (!email)
    return res.status(400).json({ success: false, error: "Email required" });

  try {
    const result = await pool.query(
      `SELECT selected_words FROM sessions WHERE email = $1 ORDER BY timestamp DESC LIMIT 1`,
      [email]
    );

    if (!result.rows.length || !result.rows[0].selected_words)
      return res.json({ success: true, data: [] });

    let words = [];
    const value = result.rows[0].selected_words;
    if (Array.isArray(value)) {
      words = value;
    } else if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) words = parsed;
      } catch {
        const trimmed = value.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          const inner = trimmed.slice(1, -1);
          const parts = inner.match(/(?:[^,"]+|"[^"]*")+/g) || [];
          words = parts.map((p) => p.replace(/^"|"$/g, "").trim());
        } else if (value.includes(",")) {
          words = value.split(",").map((w) => w.trim());
        } else if (value) {
          words = [value];
        }
      }
    }

    return res.json({ success: true, data: words.slice(0, 10) });
  } catch (err) {
    console.error("Error fetching latest words:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch latest words" });
  }
});

// -------------------- FALLBACK & SERVER --------------------
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.path });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = 8888;
  app.listen(PORT, () =>
    console.log(`✅ Backend running locally on http://localhost:${PORT}`)
  );
}

export default app;
