import React, { useState, useContext } from 'react';
import { AppContext } from "../context/AppContext";

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
  // State for toggling visibility of each feature
  const [showMoodInput, setShowMoodInput] = useState(false);
  const [showWordCloud, setShowWordCloud] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showPersonality, setShowPersonality] = useState(false);
  const [showSpotifyHistory, setShowSpotifyHistory] = useState(false);
  const { profile } = useContext(AppContext);

  return (
    <div className="mood-wrapper">
      {/* Welcome Box */}
      <div className="mood-card">
        <div className="welcome-box">
          <h1>Welcome to Moodsic!</h1>
          <p>Moodsic: Navigating the vast world of music</p>
          <p>Discover playlists tailored to your mood, personality, or even today's weather.</p>
          <p><strong>Your personalized playlist generator based on your vibe!</strong></p>

          {/* show warning if not premium */}
          {!profile?.product || profile.product !== "premium" ? (
            <p className="profile-warning">
              ⚠️ Some features require Spotify Premium.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mood-card">
        <p><em>Simply provide your mood or select from other options to create your perfect playlist.</em></p>
        <p><strong><em>Remember:</em></strong> You must select at least one feature to generate your playlist.</p>
        <div className="optional-toggles">
          <div className="button-row top">
            {/* Top row (3 buttons) */}
            <button onClick={() => setShowMoodInput(!showMoodInput)} className="feature-button">
              Mood Input
            </button>
            <button onClick={() => setShowWordCloud(!showWordCloud)} className="feature-button">
              Word Cloud
            </button>
            <button onClick={() => setShowWeather(!showWeather)} className="feature-button">
              Use Weather
            </button>
          </div>

          <div className="button-row bottom">
            {/* Bottom row (2 buttons) */}
            <button onClick={() => setShowPersonality(!showPersonality)} className="feature-button">
              Personality Quiz
            </button>
            <button onClick={() => setShowSpotifyHistory(!showSpotifyHistory)} className="feature-button">
              Use Spotify History
            </button>
          </div>
        </div>
      </div>

      {/* Mood Input Section (conditionally rendered) */}
      {showMoodInput && (
        <div className="mood-card">
          <div className="mood-input-container">
            <h1>💗 How are you feeling right now?</h1>
            <p className="subtitle">Tell us your vibe of the day 🎧</p>
            <input
              type="text"
              id="mood-input"
              placeholder="e.g. happy, calm, tired"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              style={{ padding: "8px", width: "100%", fontSize: "16px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>
        </div>
      )}

      {/* Word Cloud Selection Section (conditionally rendered) */}
      {showWordCloud && (
        <div className="mood-card">
          <h1>Pick Your Words</h1>
          <p className="subtitle">Click on the words that match your vibe <br /> (Max 3 words)</p>
          <p className="note">
            <strong>Note:</strong> Select up to 3 words that best describe how you’re feeling today to help personalize your playlist.
          </p>

          <div className="wordcloudalign">
            <div id="wordCloudContainer">
              <div id="wordCloud">
                {words.map((word, index) => (
                  <span
                    key={index}
                    className={`word ${selectedWords.includes(word) ? "selected" : ""}`}
                    onClick={() => handleWordClick(word)}
                    style={{
                      cursor: "pointer",
                      padding: "5px",
                      fontSize: "18px",
                      margin: "5px",
                      display: "inline-block",
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Words */}
          <div
            id="selectedWords"
            style={{
              display: selectedWords.length ? "block" : "none",
              marginTop: "20px",
              border: "2px solid #ddd",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            {selectedWords.length > 0
              ? selectedWords.map((word, index) => (
                <span key={index} style={{ padding: "5px", fontWeight: "bold" }}>
                  {word}
                </span>
              ))
              : <p>No words selected.</p>}
          </div>

          {wordLimitError && (
            <p style={{ color: "red", marginTop: "10px" }}>You can only select up to 3 words.</p>
          )}
        </div>
      )}

      {/* Weather Section (conditionally rendered) */}
      {showWeather && (
        <div className="mood-card">
          <h1>Weather</h1>
          <p className="subtitle">See how today's weather influences your vibe.</p>
          <div style={{ marginTop: "20px" }}>
            {locationError && <p>{locationError}</p>}
            {weatherData ? (
              <div>
                <p>Temperature: {weatherData.main.temp}°C</p>
                <p>Description: {weatherData.weather[0].description}</p>
                <img
                  src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
                  alt={weatherData.weather[0].description}
                />
              </div>
            ) : (
              <p>Loading weather...</p>
            )}
          </div>
        </div>
      )}

      {/* Personality Quiz Section (conditionally rendered) */}
      {showPersonality && (
        <div className="mood-card">
          <h1>Personality Quiz</h1>
          <p className="subtitle">Take a quiz to generate a playlist based on your personality.</p>
          {/* Add personality quiz component here */}
        </div>
      )}

      {/* Spotify History Section (conditionally rendered) */}
      {showSpotifyHistory && (
        <div className="mood-card">
          <h1>Spotify History</h1>
          <p className="subtitle">Generate a playlist based on your Spotify listening history.</p>
          {/* Add Spotify history component here */}
        </div>
      )}

      {/* Generate Button Section */}
      <button
        id="submit-btn"
        onClick={handleGenerate}
        disabled={selectedWords.length === 0 && !mood && !showWeather && !showSpotifyHistory} // Require at least one feature
        style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        Generate My Vibe 🎶
      </button>

      {(selectedWords.length === 0 && !mood && !showWeather && !showSpotifyHistory) && (
        <p style={{ color: "red", marginTop: "10px" }}>
          You must fill in at least one feature to generate your playlist.
        </p>
      )}
    </div>
  );
}
