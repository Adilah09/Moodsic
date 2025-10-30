import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from "../context/AppContext";
import WordVinyl from './WordVinyl'; // Import the WordVinyl component

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
  const [showMoodInput, setShowMoodInput] = useState(Boolean(mood));
  const [showWordCloud, setShowWordCloud] = useState(false); // Initially, show word cloud based on selection
  const [wordLimitError, setWordLimitError] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);

  // Ensure toggles reflect previous state
  useEffect(() => {
    setShowMoodInput(Boolean(mood));
    setShowWordCloud(selectedWords.length > 0);
  }, [mood, selectedWords]);

  const { profile } = useContext(AppContext);

  const handleSelectedWords = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word)); // Deselect if already selected
    } else if (selectedWords.length < 3) {
      setSelectedWords([...selectedWords, word]); // Add the word to selectedWords if < 3
    }
    // If more than 3 words are selected, show an error
    if (selectedWords.length >= 3) {
      setWordLimitError(true);
    } else {
      setWordLimitError(false);
    }
  };

  return (
    <div className="mood-wrapper">
      {/* Welcome Box */}
      <div className="mood-card">
        <div className="welcome-box">
          <h1>Welcome to Moodsic!</h1>
          <p>Moodsic: Navigating the vast world of music</p>
          <p>Discover playlists tailored to your mood, personality, or even today's weather.</p>
          <p><strong>Your personalized playlist generator based on your vibe!</strong></p>

          {!profile?.product || profile.product !== "premium" ? (
            <p className="profile-warning">
              ⚠️ Some features require Spotify Premium.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mood-card">
        <h1>Your Personalized Vibe</h1>
        <p>Explore the words that best describe your vibe today. Select up to 3 words and let them guide the generation of your playlist.</p>
        <WordVinyl handleSelectedWords={handleSelectedWords} /> {/* Add WordVinyl component */}
      </div>

      {/* Word Cloud Selection Section (conditionally rendered) */}
      {showWordCloud && (
        <div className="mood-card">
          <h1>Pick Your Words</h1>
          <p className="subtitle">Click on the words that match your vibe <br /> (Max 3 words)</p>
          <p className="note">
            <strong>Note:</strong> Select up to 3 words that best describe how you're feeling today to help personalize your playlist.
          </p>

          <div className="wordcloudalign">
            <div id="wordCloudContainer">
              <div id="wordCloud">
                {words.map((word, index) => (
                  <span
                    key={index}
                    className={`word ${selectedWords.includes(word) ? "selected" : ""}`}
                    onClick={() => handleSelectedWords(word)}
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

      {/* Mood Input Section */}
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

      {/* Weather Section (conditionally rendered) */}
      {useWeather && (
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

      {/* Generate Button Section */}
      <button
        id="submit-btn"
        onClick={handleGenerate}
        disabled={selectedWords.length === 0 && !mood && !useWeather && !useSpotifyHistory} // Require at least one feature
        style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        Generate My Vibe 🎶
      </button>

      {(selectedWords.length === 0 && !mood && !useWeather && !useSpotifyHistory) && (
        <p style={{ color: "red", marginTop: "10px" }}>
          You must fill in at least one feature to generate your playlist.
        </p>
      )}
    </div>
  );
}
