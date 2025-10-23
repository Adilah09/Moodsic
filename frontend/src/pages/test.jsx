import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";

function Home() {
  const [weatherData, setWeatherData] = useState(null); // Store weather data
  const [locationError, setLocationError] = useState(null);
  const [selectedWords, setSelectedWords] = useState([]); // Store selected words from word cloud

  const words = [
    "Anger", "Chill", "Vibes", "Surreal", "Sadness", "Peace", "Excitement", "Motivation", "Fear", "Inspiration"
  ];

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

  // Word Cloud Functions
  const getRandomWords = (wordList, count = 10) => {
    const shuffled = [...wordList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleWordClick = (word) => {
    setSelectedWords((prevSelected) => {
      if (prevSelected.includes(word)) {
        return prevSelected.filter((item) => item !== word); // Remove word
      } else {
        return [...prevSelected, word]; // Add word
      }
    });
  };

  const displayWords = getRandomWords(words);

  const handleGenerate = () => {
    console.log("Selected Words:", selectedWords);
    // Add additional actions here, such as generating playlists or passing data to an AI.
  };

  return (
    <div className="mood-wrapper">
      <div className="mood-card">
        <h1>What's your vibe today?</h1>
        <p className="subtitle">Tap a word below that fits your mood!</p>

        {/* Word Cloud */}
        <div className="wordcloudalign">
          <h2>Select Words</h2>
          <div id="wordCloudContainer">
            <div id="wordCloud">
              {displayWords.map((word, index) => (
                <span
                  key={index}
                  className="word"
                  onClick={() => handleWordClick(word)}
                  style={{ cursor: "pointer", padding: "5px", fontSize: "18px", margin: "5px", display: "inline-block" }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
          <button id="submitBtn" onClick={handleGenerate}>
            Submit
          </button>
          <div id="selectedWords" style={{ display: selectedWords.length ? "block" : "none", marginTop: "20px" }}>
            {selectedWords.length > 0 ? (
              selectedWords.map((word, index) => <span key={index} style={{ padding: "5px", fontWeight: "bold" }}>{word}</span>)
            ) : (
              <p>No words selected.</p>
            )}
          </div>
        </div>

        {/* Weather Display */}
        <div className="weather-container">
          {locationError && <p>{locationError}</p>}
          {weatherData ? (
            <div>
              <h3>Current Weather</h3>
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
    </div>
  );
}

export default Home;
