import React, { useRef, useEffect, useState, useContext } from "react";
import "./Home.css";
import { AppContext } from "../context/AppContext";
import WordVinyl from "./WordVinyl";
import FaceMood from "./FaceMood.jsx"

export default function HomeUI({
  selectedWords,
  wordLimitError,
  handleWordClick,
  useWeather,
  setWeather,
  useSpotifyHistory,
  setUseSpotifyHistory,
  locationError,
  weatherData,
  handleGenerate,
  mood,
  setMood,
  faceMood,
  setFaceMood,
  error,
  spotifyTopArtists = [],
  spotifyGenres = []
}) {
  const { profile } = useContext(AppContext);
  const optionsRef = useRef(null);
  const [showTopButton, setShowTopButton] = useState(false);

  const [showMood, setShowMood] = useState(false);
  const [showVibe, setShowVibe] = useState(false);

  const [showFace, setShowFace] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [locked, setLocked] = useState(false);
  const [faceMoodLocal, setFaceMoodLocal] = useState(null);


  // Scroll & progress
  useEffect(() => {
    const handleScroll = () => setShowTopButton(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="mood-wrapper">
      {/* Hero Section */}
      <div className="mood-card welcome-box">
        <h1>Welcome to Moodsic!</h1>
        <p>
          Let's create the <b>perfect playlist</b> that matches exactly how you're feeling right now! ✨
        </p>
        {!profile?.product || profile.product !== "premium" ? (
          <p className="profile-warning">
            ⚠️ Some features require Spotify Premium.
          </p>
        ) : null}
      </div>

      {/* Mood + Vibe Section */}
      <div className="mode-select-card fade-section">
        <h2 className="msg">
          Choose your preferred feature or do all!
        </h2>

        <div className="button-row top">
          <button
            className={`feature-button ${showMood ? "selected" : ""}`}
            onClick={() => {
              setShowMood(!showMood);
              setShowVibe(false);
              setShowFace(false);
            }}
          >
            Mood Input
          </button>
          <button
            className={`feature-button ${showVibe ? "selected" : ""}`}
            onClick={() => {
              setShowVibe(!showVibe);
              setShowMood(false);
              setShowFace(false);
            }}
          >
            Word Vinyl
          </button>
          <button
            className={`feature-button ${showFace ? "selected" : ""}`}
            onClick={() => {
              setShowFace(!showFace);
              setShowMood(false);
              setShowVibe(false);
            }}
          >
            Face Mood
          </button>
        </div>

        {/* Mood Input Card */}
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

        {/* Word Cloud Card */}
        {showVibe && (
          <div className="mini-card expanded-section bounce-in">
            <h3 className="msg">💿 Select up to 3 words that capture your energy:</h3>

            <div className="ring-container-wrapper">
              <WordVinyl handleSelectedWords={handleWordClick} />
            </div>

            {/* Box only when words exist */}
            {selectedWords && selectedWords.length > 0 && (
              <div
                className={`word-display-box ${wordLimitError ? "pulse" : ""
                  }`}
              >
                <p className="word-line">{selectedWords.join("  ")}</p>
              </div>
            )}

            {/* Red warning below the box */}
            {wordLimitError && (
              <p className="word-warning">Oops! You can only pick 3 words — choose your favorites!</p>
            )}
          </div>
        )}
        {/* Face Mood Card */}
        {showFace && (
          <div className="mini-card expanded-section bounce-in">
            <h3 className="msg">😎 Let us detect your mood from your face!</h3>

            <FaceMood
              isActive={showFace}
              paused={locked}
              onFaceDetected={setFaceDetected}
              onMoodCalculated={setFaceMoodLocal}
            />

            {!locked && (
              <button
                className="feature-button lock-btn"
                onClick={() => {
                  setLocked(true);
                  setFaceMood(faceMoodLocal || "neutral");
                }}
                disabled={!faceDetected}
              >
                Lock In Mood
              </button>
            )}

            {locked && (
              <>
                <div className="word-line">Detected Mood: {faceMoodLocal}</div>
                <button
                  className="feature-button retry"
                  onClick={() => {
                    setLocked(false);
                    setFaceMoodLocal(null);
                  }}
                >
                  Retry
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Personalization Section */}
      <div ref={optionsRef} className="options-card fade-section">
        <h2 className="msg">Personalise your playlist here!</h2>

        <div className="optional-toggles">
          <label>
            <input
              type="checkbox"
              checked={useWeather}
              onChange={(e) => setWeather(e.target.checked)}
            />
            🌤️ Use Current Weather
          </label>
          <label>
            <input
              type="checkbox"
              checked={useSpotifyHistory}
              onChange={(e) => setUseSpotifyHistory(e.target.checked)}
            />
            🎧 Use My Spotify Listening History
          </label>
        </div>

        {/* Expandable content area - shows horizontally when multiple are selected */}
        {(useWeather || useSpotifyHistory) && (
          <div className="personalization-content">
            {useWeather && weatherData && (
              <div className="content-card weather-card">
                <div className="weather-icon-wrapper">
                  <img
                    src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                    alt={weatherData.weather[0].description}
                    className="weather-icon"
                  />
                </div>
                <div className="weather-info">
                  <div className="weather-temp">{Math.round(weatherData.main.temp)}°C</div>
                  <div className="weather-desc">{weatherData.weather[0].description}</div>
                  <div className="weather-location">📍 {weatherData.name || "Current Location"}</div>
                </div>
              </div>
            )}

            {useSpotifyHistory && (spotifyTopArtists.length > 0 || spotifyGenres.length > 0) && (
              <div className="content-card spotify-card">
                <div className="spotify-icon">🎧</div>
                <div className="spotify-info">
                  <div className="spotify-title">Your Top Genres</div>
                  <div className="spotify-tags">
                    {spotifyGenres.slice(0, 5).map((genre, idx) => (
                      <span key={idx} className="genre-tag">{genre}</span>
                    ))}
                  </div>
                  {spotifyTopArtists.length > 0 && (
                    <div className="spotify-artists">
                      <div className="artists-label">Top Artists:</div>
                      <div className="artists-list">{spotifyTopArtists.slice(0, 3).join(", ")}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          id="submit-btn"
          onClick={handleGenerate}
        >
          🫰 Generate My Playlist
        </button>

        {error && <p className="error-banner">{error}</p>}
        {locationError && <p className="error-banner">{locationError}</p>}
      </div>

      {/* Back to Top */}
      {showTopButton && (
        <button className="back-to-top" onClick={scrollToTop}>
          ↑
        </button>
      )}
    </div>
  );
}