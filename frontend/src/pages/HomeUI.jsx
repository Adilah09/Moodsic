import React, { useRef, useEffect, useState, useContext } from "react";
import "./Home.css";
import { AppContext } from "../context/AppContext";
import WordVinyl from "./WordVinyl"; // vinyl component

export default function HomeUI({
  words,
  selectedWords,
  wordLimitError,
  handleWordClick,
  useWeather,
  setWeather,
  usePersonality,
  setUsePersonality,
  useSpotifyHistory,
  setUseSpotifyHistory,
  locationError,
  weatherData,
  handleGenerate,
  mood,
  setMood,
  error
}) {
  const { profile } = useContext(AppContext);
  const modeRef = useRef(null);
  const optionsRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [showTopButton, setShowTopButton] = useState(false);

  const [showMood, setShowMood] = useState(false);
  const [showVibe, setShowVibe] = useState(false);

  // 🧭 Scroll & progress
  useEffect(() => {
    const handleScroll = () => setShowTopButton(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToMode = () => modeRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  

  useEffect(() => {
    let step = 0;
    if (useWeather || usePersonality || useSpotifyHistory) step += 1;
    if (mood || selectedWords.length > 0) step += 1;
    setProgress(step);
  }, [useWeather, usePersonality, useSpotifyHistory, mood, selectedWords]);

  return (
    <div className="mood-wrapper">
      {/* 🌈 Progress Bar */}
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${(progress / 2) * 100}%` }}
        ></div>
        <div className="progress-steps">
          <span className={progress >= 0 ? "active-step" : ""}>① Start</span>
          <span className={progress >= 1 ? "active-step" : ""}>② Mood</span>
          <span className={progress === 2 ? "active-step" : ""}>③ Personalize</span>
        </div>
      </div>

      {/* 🎵 Hero Section */}
      <div className="mood-card welcome-box">
        <h1>Welcome to Moodsic 🎶</h1>
        <p>
          Discover playlists tailored to <b>your vibe</b> — from mood to
          weather, personality, and Spotify history.
        </p>
        {!profile?.product || profile.product !== "premium" ? (
          <p className="profile-warning">
            ⚠️ Some features require Spotify Premium.
          </p>
        ) : null}
        <button className="primary-btn" onClick={scrollToMode}>
          Figure Out Your Mood 💫
        </button>
      </div>

      {/* 💭 Mood + Vibe Section */}
      <div ref={modeRef} className="mode-select-card fade-section">
        <h2 className="subtitle">
          Choose how you'd like to create your playlist 🎧
        </h2>

        <div className="button-row top">
          <button
            className={`feature-button ${showMood ? "selected" : ""}`}
            onClick={() => {
              setShowMood(!showMood);
              setShowVibe(false);
            }}
          >
            Mood Input
          </button>
          <button
            className={`feature-button ${showVibe ? "selected" : ""}`}
            onClick={() => {
              setShowVibe(!showVibe);
              setShowMood(false);
            }}
          >
            Word Cloud
          </button>
        </div>

        {/* 💗 Mood Input Card */}
        {showMood && (
          <div className="mini-card expanded-section bounce-in">
            <h3 className="subtitle">💗 How are you feeling today?</h3>
            <input
              id="mood-input"
              type="text"
              placeholder="e.g., happy, calm, nostalgic..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
          </div>
        )}

        {/* 🎨 Word Cloud Card */}
        {showVibe && (
          <div className="mini-card expanded-section bounce-in">
            <h3 className="subtitle">🌈 Select up to 3 words that match your vibe:</h3>

            <div className="ring-container-wrapper">
              <WordVinyl handleSelectedWords={handleWordClick} />
            </div>

            {/* Box only when words exist */}
            {selectedWords && selectedWords.length > 0 && (
              <div
                className={`word-display-box ${
                  wordLimitError ? "pulse" : ""
                }`}
              >
                <p className="word-line">{selectedWords.join("  ")}</p>
              </div>
            )}

            {/* Red warning below the box */}
            {wordLimitError && (
              <p className="word-warning">You can only select up to 3 words.</p>
            )}
          </div>
        )}
      </div>

      {/* 🌦️ Personalization Section */}
      <div ref={optionsRef} className="options-card fade-section">
        <h2 className="subtitle">Add more to personalize your vibe:</h2>

        <div className="optional-toggles">
          <label>
            <input
              type="checkbox"
              checked={useWeather}
              onChange={(e) => setWeather(e.target.checked)}
            />
            🌤️ Use today's weather
          </label>
          <label>
            <input
              type="checkbox"
              checked={usePersonality}
              onChange={(e) => setUsePersonality(e.target.checked)}
            />
            🧠 Include my personality quiz
          </label>
          <label>
            <input
              type="checkbox"
              checked={useSpotifyHistory}
              onChange={(e) => setUseSpotifyHistory(e.target.checked)}
            />
            🎧 Use my Spotify listening history
          </label>
        </div>

        {useWeather && weatherData && (
          <div className="weather-display">
            <p>🌡️ {weatherData.main.temp}°C</p>
            <p>{weatherData.weather[0].description}</p>
            <img
              src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
              alt={weatherData.weather[0].description}
            />
          </div>
        )}

        <button
          id="submit-btn"
          disabled={
            !mood &&
            selectedWords.length === 0 &&
            !useWeather &&
            !usePersonality &&
            !useSpotifyHistory
          }
          onClick={handleGenerate}
        >
          Generate My Playlist 🎶
        </button>

        {error && <p className="error-banner">{error}</p>}
        {locationError && <p className="error-banner">{locationError}</p>}
      </div>

      {/* ⬆️ Back to Top */}
      {showTopButton && (
        <button className="back-to-top" onClick={scrollToTop}>
          ↑
        </button>
      )}
    </div>
  );
}
