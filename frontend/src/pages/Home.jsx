import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";

function Home() {
  const [weatherData, setWeatherData] = useState(null); // Store weather data
  const [useWeather, setWeather] = useState(false);
  const [usePersonality, setUsePersonality] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [selectedWords, setSelectedWords] = useState([]); // Store selected words from word cloud
  const [wordLimitError, setWordLimitError] = useState(false); // Error when exceeding word limit

  const words = [
    "Joy", "Sadness", "Excitement", "Chill", "Energy", "Peace", "Anger", "Happiness", "Motivation", "Relax",
    "Adventure", "Calm", "Fun", "Vibes", "Love", "Surprise", "Surreal"
  ];

  // Fetch weather data based on geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
              params: {
                lat: latitude,
                lon: longitude,
                appid: "bbc23dde07349494203ae99ffadebca4", // Replace with your API key
                units: "metric",
              },
            });
            setWeatherData(res.data); // Store weather data in state
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
    // Log selected words and weather data when the button is clicked
    console.log("Selected Words:", selectedWords);
    if (useWeather && weatherData) {
      console.log("Weather Data:", weatherData);
      // If "Use Weather" is checked, you can process weather data here as well
    }

    // You can send the selected words, weather data, and other state to an API or generate a playlist here
  };

  // Word Cloud Functions
  const handleWordClick = (word) => {
    if (selectedWords.includes(word)) {
      // If the word is already selected, remove it
      setSelectedWords((prevSelected) => prevSelected.filter((item) => item !== word));
      setWordLimitError(false); // Reset error if word is removed
    } else if (selectedWords.length < 3) {
      // Allow selecting if less than 3 words are selected
      setSelectedWords((prevSelected) => [...prevSelected, word]);
    } else {
      // Display error if more than 3 words are selected
      setWordLimitError(true);
    }
  };

  return (
    <div className="mood-wrapper">
      <div className="mood-card">
        <h1>Pick Your Words</h1>
        <p className="subtitle">Click on the words that match your vibe <br></br> (Max 3 words)</p>

        {/* Word Cloud */}
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

          {/* Display selected words with border */}
          <div
            id="selectedWords"
            style={{
              display: selectedWords.length ? "block" : "none",
              marginTop: "20px",
              border: "2px solid #ddd", // Add a light border
              padding: "10px", // Add padding for spacing
              borderRadius: "8px", // Optional: rounded corners
            }}
          >
            {selectedWords.length > 0 ? (
              selectedWords.map((word, index) => (
                <span key={index} style={{ padding: "5px", fontWeight: "bold" }}>
                  {word}
                </span>
              ))
            ) : (
              <p>No words selected.</p>
            )}
          </div>

          {/* Word Limit Error Message */}
          {wordLimitError && (
            <p style={{ color: "red", marginTop: "10px" }}>
              You can only select up to 3 words.
            </p>
          )}
        </div>

        {/* Optional Toggles */}
        <br />
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

        {/* Weather Display */}
        <div>
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

        {/* Generate My Vibe button */}
        <button
          id="submit-btn"
          onClick={handleGenerate}
          disabled={selectedWords.length === 0} // Disable button if no words are selected
        >
          Generate My Vibe 🎶
        </button>
      </div>
    </div>
  );
}

export default Home;
