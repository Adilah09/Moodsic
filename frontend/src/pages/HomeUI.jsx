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
  return (
    <div className="mood-wrapper">
      <div className="mood-card">
        {/* Mood Input */}
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

        <br />
        <hr />

        {/* Word Selection */}
        <div className="word-selection-container">
          <h1>Pick Your Words</h1>
          <p className="subtitle">Click on the words that match your vibe <br /> (Max 3 words)</p>

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

        <hr />

        {/* Optional Toggles */}
        <br />
        <div className="optional-toggles" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label>
            <input type="checkbox" checked={useWeather} onChange={() => setWeather(!useWeather)} />
            Use Weather
          </label>
          <label>
            <input type="checkbox" checked={usePersonality} onChange={() => setUsePersonality(!usePersonality)} />
            Personality Quiz
          </label>
          <label>
            <input type="checkbox" checked={useSpotifyHistory} onChange={() => setUseSpotifyHistory(!useSpotifyHistory)} />
            Use Spotify History
          </label>
        </div>

        {/* Weather Display */}
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

          {error && <div className="error-banner">{error}</div>}

        {/* Generate Button */}
        <button
          id="submit-btn"
          onClick={handleGenerate}
          disabled={selectedWords.length === 0 && !mood} // require either a mood or words
          style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          Generate My Vibe 🎶
        </button>
      </div>
    </div>
  );
}
