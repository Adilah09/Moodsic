// backend/server.js
require('dotenv').config();
const express = require('express');
const querystring = require('querystring');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Debug logs to confirm .env loaded
console.log('Client ID:', CLIENT_ID);
console.log('Client Secret loaded?', CLIENT_SECRET ? 'Yes' : 'No');

// Endpoint to get Spotify token
app.get('/api/token', async (req, res) => {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: querystring.stringify({ grant_type: 'client_credentials' })
    });

    const data = await response.json();
    if (data.access_token) {
      res.json(data);
    } else {
      res.status(500).json({ error: 'Failed to get token', details: data });
    }
  } catch (err) {
    console.error('Spotify token fetch error:', err);
    res.status(500).json({ error: 'Failed to get token', details: err.toString() });
  }
});

// Endpoint to get weather data
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

    const weatherTypeImages = {
      Clear: "/img/weather/clear.jpg",
      Clouds: "/img/weather/clouds.jpg",
      Haze: "/img/weather/haze.jpg",
      Mist: "/img/weather/mist.jpg",
      Rain: "/img/weather/rain.jpg",
      Smoke: "/img/weather/smoke.jpg",
      Snow: "/img/weather/snow.jpg",
      Thunderstorm: "/img/weather/thunderstorm.jpg",
    };

    const weatherMain = response.data.weather[0].main;
    const images = weatherTypeImages[weatherMain] ? [weatherTypeImages[weatherMain]] : [];

    res.json({
      temp: response.data.main.temp,
      description: response.data.weather[0].description,
      main: weatherMain,
      images,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});


const PORT = 8888;
app.listen(PORT, () => console.log(`Backend running on http://127.0.0.1:${PORT}`));
