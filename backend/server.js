import querystring from "querystring";

import axios from "axios";

import fetch from "node-fetch";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


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
    // Send token back to frontend
    res.redirect(`${FRONTEND_URI}/?${params}`);
  } else {
    console.error("Token exchange failed:", data);
    res.status(400).json({ error: 'Token exchange failed', details: data });
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

// --- GENERATE VIBE & PLAYLIST ENDPOINT ---
app.post("/api/generatePlaylist", async (req, res) => {
  const { mood, selectedWords, weather, personalityVector, spotifyGenres, accessToken } = req.body;

  if (!accessToken) return res.status(400).json({ error: "Spotify access token required" });

  try {
    // --- 1️⃣ Generate vibe phrase with AI ---
    const prompt = `
You are a vibe generator. 
Given the following inputs, create a concise 3-5 word phrase that captures the user's mood and vibe.

Mood: ${mood}
Selected Words: ${selectedWords.join(", ")}
Weather: ${weather ? JSON.stringify(weather) : "none"}
Personality: ${personalityVector ? JSON.stringify(personalityVector) : "none"}
Spotify Genres: ${spotifyGenres ? spotifyGenres.join(", ") : "none"}

Output ONLY the phrase.
    `;

    const vibeResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 20,
    });

    const vibePhrase = vibeResponse.choices[0].message.content.trim();

    // --- 2️⃣ Generate Spotify playlist ---
    const params = new URLSearchParams();
    params.append("seed_genres", spotifyGenres && spotifyGenres.length > 0 ? spotifyGenres.slice(0,5).join(",") : "pop");
    params.append("limit", "20");
    params.append("market", "from_token");

    const spotifyRes = await axios.get(
      `https://api.spotify.com/v1/recommendations?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const tracks = spotifyRes.data.tracks.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      preview_url: track.preview_url,
      uri: track.uri,
    }));

    // --- 3️⃣ Return combined response ---
    res.json({ vibePhrase, tracks });

  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: "Failed to generate vibe & playlist" });
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

app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.path });
});


const PORT = 8888;
app.listen(PORT, () => console.log(`Backend running on http://127.0.0.1:${PORT}`));
