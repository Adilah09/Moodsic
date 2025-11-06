import React, { useRef, useEffect, useState, useContext } from "react";
import "./Home.css";
import { AppContext } from "../context/AppContext";
import WordVinyl from "./WordVinyl"; // Vinyl component

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
  error,
  spotifyTopArtists = [],
  spotifyGenres = [],
}) {
  const { profile } = useContext(AppContext);
  const modeRef = useRef(null);
  const optionsRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [showTopButton, setShowTopButton] = useState(false);

  const [showMood, setShowMood] = useState(false);
  const [showVibe, setShowVibe] = useState(false);

  // Scroll and show "back to top" button
  useEffect(() => {
    const handleScroll = () => setShowTopButton(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Update progress indicator (2 steps)
  useEffect(() => {
    let step = 0;
    if (useWeather || usePersonality || useSpotifyHistory) step += 1;
    if (mood || selectedWords && selectedWords.length > 0) step += 1;
    setProgress(step);
  }, [useWeather, usePersonality, useSpotifyHistory, mood, selectedWords]);

  return (
    <div className="mood-wrapper">
      {/* ---------- HERO SECTION ---------- */}
      <div className="mood-card welcome-box">
        <h1>Welcome to Moodsic!</h1>
        <p>
          Let's create the <b>perfect playlist</b> that matches exactly how
          you're feeling right now! ✨
        </p>
        {!profile?.product || profile.product !== "premium" ? (
          <p className="profile-warning">
            ⚠️ Some features require Spotify Premium.
          </p>
        ) : null}
      </div>

      {/* ---------- MOOD + VIBE SELECTION ---------- */}
      <div className="mode-select-card fade-section">
        <h2 className="msg">
          Tell us how you're feeling! Type your mood and/or spin the word vinyl
          to pick up to 3 words.
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
            Word Vinyl
          </button>
        </div>

        {/* ---------- MOOD INPUT ---------- */}
        {showMood && (
          <div className="mini-card expanded-section bounce-in">
            <h3 className="msg">💗 What's your vibe right now?</h3>
            <input
              id="mood-input"
              type="text"
              placeholder="e.g., happy, calm, nostalgic, pumped up..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
          </div>
        )}

        {/* ---------- WORD VINYL ---------- */}
        {showVibe && (
          <div className="mini-card expanded-section bounce-in">
            <h3 className="msg">💿 Select up to 3 words that capture your energy:</h3>

            {/* Word vinyl spinner */}
            <div className="ring-container-wrapper">
              <WordVinyl handleSelectedWords={handleWordClick} />
            </div>

            {/* Selected words box */}
            {selectedWords && selectedWords.length > 0 && (
              <div
                className={`word-display-box ${wordLimitError ? "pulse" : ""}`}
              >
                <p className="word-line">{selectedWords.join("  ")}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------- OPTIONS / FEATURES SECTION ---------- */}
      <div className="mode-select-card fade-section">
        <h2 className="msg">Enhance your playlist with optional features</h2>
        <div className="feature-toggles">
          <button
            className={`feature-button ${useWeather ? "selected" : ""}`}
            onClick={() => setWeather(!useWeather)}
          >
            🌤 Include Current Weather
          </button>
          <button
            className={`feature-button ${usePersonality ? "selected" : ""}`}
            onClick={() => setUsePersonality(!usePersonality)}
          >
            🧠 Use Personality Insights
          </button>
          <button
            className={`feature-button ${useSpotifyHistory ? "selected" : ""}`}
            onClick={() => setUseSpotifyHistory(!useSpotifyHistory)}
          >
            🎧 Use Spotify Listening History
          </button>
        </div>

        {locationError && (
          <p className="error-msg">⚠️ Unable to get location data.</p>
        )}
      </div>

      {/* ---------- GENERATE PLAYLIST BUTTON ---------- */}
      <div className="generate-card fade-section">
        <h2>You're ready to vibe 🎶</h2>
        <p>Select your options and tap below to generate your custom playlist!</p>

        {error && <p className="error-msg">⚠️ {error}</p>}

        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={!mood && selectedWords.length === 0}
        >
          Generate Playlist
        </button>

        {/* Progress bar (optional visual feedback) */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(progress / 2) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* ---------- BACK TO TOP BUTTON ---------- */}
      {showTopButton && (
        <button className="back-to-top" onClick={scrollToTop}>
          ⬆️ Top
        </button>
      )}
    </div>
  );
}
