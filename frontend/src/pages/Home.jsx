import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";

function Home() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [useWeather, setWeather] = useState(false);
  const [usePersonality, setUsePersonality] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const moods = [
    { label: "😎 Chill", value: "chill" },
    { label: "😃 Happy", value: "happy" },
    { label: "😢 Sad", value: "sad" },
    { label: "🔥 Energetic", value: "energetic" },
    { label: "💤 Lazy", value: "lazy" },
  ];

  const handleMoodClick = (mood) => setSelectedMood(mood);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await axios.get("/api/weather", {
              params: { lat: latitude, lon: longitude },
            });
            setWeather(res.data);
          } catch (err) {
            console.error(err);
          }
        },
        (error) => setLocationError("Could not get your location."),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation not supported.");
    }
  }, []);

  const handleGenerate = async () => {
  console.log("Mood:", selectedMood);
  console.log("Use Personality Quiz:", usePersonality);
  // pass mood + weatherData + personality vector to your AI
};
  return (
    <div className="mood-wrapper">
      <div className="mood-card">
        <h1>What's your vibe today?</h1>
        <p className="subtitle">Tap your current mood or choose a surprise!</p>

        {/* Mood input grid */}
        <div className="mood-grid">
          {moods.map((mood) => (
            <button
              key={mood.value}
              className={`mood-btn ${selectedMood === mood.value ? "active" : ""}`}
              onClick={() => handleMoodClick(mood.value)}
            >
              {mood.label}
            </button>
          ))}
        </div>

        {/* Optional Toggles */}
        <div className="optional-toggles">
          <label>
            <input
              type="checkbox"
              checked={useWeather}
              onChange={() => setWeather(!useWeather)}
            />
            Use Weather
          </label>
          <label>
            <input
              type="checkbox"
              checked={usePersonality}
              onChange={() => setUsePersonality(!usePersonality)}
            />
            Personality Quiz
          </label>
        </div>

        {/* Mood Options */}
        <div className="mood-options">
          <button className="option-btn" onClick={() => console.log("Surprise Me!")}>
            Use my Spotify Data
          </button>
          <button
            className="option-btn"
            onClick={() => console.log("Based on My Vibe!")}
          >
            Fresh Moods
          </button>
        </div>

        {/* Generate Playlist */}
        <button
          id="submit-btn"
          disabled={!selectedMood}
          onClick={handleGenerate}
        >
          Generate My Vibe 🎶
        </button>

            <div>
      {locationError && <p>{locationError}</p>}
      {setWeather ? (
        <div>
          <p>Temp: {setWeather.temp}°C</p>
          <p>Description: {setWeather.description}</p>
        </div>
      ) : (
        <p>Loading weather...</p>
      )}

    </div>
      </div>
    </div>
  );
}

export default Home;
