import querystring from "querystring";
import axios from "axios";
import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

import sotdRouter from "./routes/sotd.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:8888/callback';
const FRONTEND_URI = 'http://localhost:3000';

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
    return res.redirect(`${FRONTEND_URI}/login?error=access_denied`);
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
      return res.redirect(`${FRONTEND_URI}/login?error=token_failed`);
    }
  } catch (err) {
    console.error("Error during token exchange:", err);
    return res.redirect(`${FRONTEND_URI}/login?error=server_error`);
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
app.post("/api/generatePlaylist", async (req, res) => {
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

    // ----- 1️⃣ Generate vibe phrase with Gemini AI -----
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

    // ----- 2️⃣ Search Spotify tracks safely -----
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

    // ----- 3️⃣ Return results -----
    res.json({ vibePhrase, tracks });

  } catch (err) {
    console.error("Error generating playlist:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Failed to generate playlist" });
  }
});


// --- WEATHER DATA ENDPOINT ---
app.get("/api/weather", async (req, res) => {
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

app.use(sotdRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.path });
});


const PORT = 8888;
app.listen(PORT, () => console.log(`Backend running on http://127.0.0.1:${PORT}`));
