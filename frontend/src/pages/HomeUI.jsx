// import React, { useState, useContext, useEffect } from 'react';
// import { AppContext } from "../context/AppContext";

// export default function HomeUI({
//   words,
//   selectedWords,
//   wordLimitError,
//   handleWordClick,
//   useWeather,
//   setWeather,
//   usePersonality,
//   setUsePersonality,
//   useSpotifyHistory,
//   setUseSpotifyHistory,
//   locationError,
//   weatherData,
//   handleGenerate,
//   mood,
//   setMood,
//   error
// }) {
//   // State for toggling visibility of each feature
//   const [showMoodInput, setShowMoodInput] = useState(Boolean(mood));;
//   const [showWordCloud, setShowWordCloud] = useState(selectedWords.length > 0);

//   // Ensure toggles reflect previous state
//   useEffect(() => {
//     setShowMoodInput(Boolean(mood));
//     setShowWordCloud(selectedWords.length > 0);
//   }, [mood, selectedWords]);

//   const { profile } = useContext(AppContext);

//   return (
//     <div className="mood-wrapper">
//       {/* Welcome Box */}
//       <div className="mood-card">
//         <div className="welcome-box">
//           <h1>Welcome to Moodsic!</h1>
//           <p>Moodsic: Navigating the vast world of music</p>
//           <p>Discover playlists tailored to your mood, personality, or even today's weather.</p>
//           <p><strong>Your personalized playlist generator based on your vibe!</strong></p>

//           {/* show warning if not premium */}
//           {!profile?.product || profile.product !== "premium" ? (
//             <p className="profile-warning">
//               ⚠️ Some features require Spotify Premium.
//             </p>
//           ) : null}
//         </div>
//       </div>

//       <div className="mood-card">
//         <p><em>Simply provide your mood or select from other options to create your perfect playlist.</em></p>
//         <p><strong><em>Remember:</em></strong> You must select at least one feature to generate your playlist.</p>
//         <div className="optional-toggles">
//           <div className="button-row top">
//             {/* Top row (3 buttons) */}
//             <button onClick={() => setShowMoodInput(!showMoodInput)} className="feature-button">
//               What's Your Mood?
//             </button>
//             <button onClick={() => setShowWordCloud(!showWordCloud)} className="feature-button">
//              Pick Your Vibe!
//             </button>
//             <button onClick={() => setWeather(!useWeather)} className="feature-button">
//               Vibe with the Weather!
//             </button>
//           </div>

//           <div className="button-row bottom">
//             {/* Bottom row (2 buttons) */}
//             <button onClick={() => setUsePersonality(!usePersonality)} className="feature-button">
//               What's Your Personality Vibe?
//             </button>
//             <button onClick={() => setUseSpotifyHistory(!useSpotifyHistory)} className="feature-button">
//               Create from My Spotify History
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mood Input Section (conditionally rendered) */}
//       {showMoodInput && (
//         <div className="mood-card">
//           <div className="mood-input-container">
//             <h1>💗 How are you feeling right now?</h1>
//             <p className="subtitle">Tell us your vibe of the day 🎧</p>
//             <input
//               type="text"
//               id="mood-input"
//               placeholder="e.g. happy, calm, tired"
//               value={mood}
//               onChange={(e) => setMood(e.target.value)}
//               style={{ padding: "8px", width: "100%", fontSize: "16px", borderRadius: "6px", border: "1px solid #ccc" }}
//             />
//           </div>
//         </div>
//       )}

//       {/* Word Cloud Selection Section (conditionally rendered) */}
//       {showWordCloud && (
//         <div className="mood-card">
//           <h1>Pick Your Words</h1>
//           <p className="subtitle">Click on the words that match your vibe <br /> (Max 3 words)</p>
//           <p className="note">
//             <strong>Note:</strong> Select up to 3 words that best describe how you're feeling today to help personalize your playlist.
//           </p>

//           <div className="wordcloudalign">
//             <div id="wordCloudContainer">
//               <div id="wordCloud">
//                 {words.map((word, index) => (
//                   <span
//                     key={index}
//                     className={`word ${selectedWords.includes(word) ? "selected" : ""}`}
//                     onClick={() => handleWordClick(word)}
//                     style={{
//                       cursor: "pointer",
//                       padding: "5px",
//                       fontSize: "18px",
//                       margin: "5px",
//                       display: "inline-block",
//                     }}
//                   >
//                     {word}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Selected Words */}
//           <div
//             id="selectedWords"
//             style={{
//               display: selectedWords.length ? "block" : "none",
//               marginTop: "20px",
//               border: "2px solid #ddd",
//               padding: "10px",
//               borderRadius: "8px",
//             }}
//           >
//             {selectedWords.length > 0
//               ? selectedWords.map((word, index) => (
//                 <span key={index} style={{ padding: "5px", fontWeight: "bold" }}>
//                   {word}
//                 </span>
//               ))
//               : <p>No words selected.</p>}
//           </div>

//           {wordLimitError && (
//             <p style={{ color: "red", marginTop: "10px" }}>You can only select up to 3 words.</p>
//           )}
//         </div>
//       )}

//       {/* Weather Section (conditionally rendered) */}
//       {useWeather && (
//         <div className="mood-card">
//           <h1>Weather</h1>
//           <p className="subtitle">See how today's weather influences your vibe.</p>
//           <div style={{ marginTop: "20px" }}>
//             {locationError && <p>{locationError}</p>}
//             {weatherData ? (
//               <div>
//                 <p>Temperature: {weatherData.main.temp}°C</p>
//                 <p>Description: {weatherData.weather[0].description}</p>
//                 <img
//                   src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
//                   alt={weatherData.weather[0].description}
//                 />
//               </div>
//             ) : (
//               <p>Loading weather...</p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Personality Quiz Section (conditionally rendered) */}
//       {usePersonality && (
//         <div className="mood-card">
//           <h1>Personality Quiz</h1>
//           <p className="subtitle">Take a quiz to generate a playlist based on your personality.</p>
//           {/* Add personality quiz component here */}
//         </div>
//       )}

//       {/* Spotify History Section (conditionally rendered) */}
//       {useSpotifyHistory && (
//         <div className="mood-card">
//           <h1>Spotify History</h1>
//           <p className="subtitle">Generate a playlist based on your Spotify listening history.</p>
//           {/* Add Spotify history component here */}
//         </div>
//       )}

//       {/* Generate Button Section */}
//       <button
//         id="submit-btn"
//         onClick={handleGenerate}
//         disabled={selectedWords.length === 0 && !mood && !useWeather && !useSpotifyHistory} // Require at least one feature
//         style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
//       >
//         Generate My Vibe 🎶
//       </button>

//       {(selectedWords.length === 0 && !mood && !useWeather && !useSpotifyHistory) && (
//         <p style={{ color: "red", marginTop: "10px" }}>
//           You must fill in at least one feature to generate your playlist.
//         </p>
//       )}
//     </div>
//   );
// }

import React, { useRef, useEffect, useState, useContext } from "react";
import "./Home.css";
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
  const { profile } = useContext(AppContext);

  // 🌸 Scroll & animation state
  const modeRef = useRef(null);
  const optionsRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [showTopButton, setShowTopButton] = useState(false);

  // 🎛️ Toggle states
  const [showMood, setShowMood] = useState(false);
  const [showVibe, setShowVibe] = useState(false);

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
          <p className="profile-warning">⚠️ Some features require Spotify Premium.</p>
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

        {/* 💗 Mood Mini Card */}
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

        {/* 🎨 Word Cloud Mini Card */}
        {showVibe && (
          <div className="mini-card expanded-section bounce-in">
            <h3 className="subtitle">🌈 Select up to 3 words that match your vibe:</h3>
            <div id="wordCloud">
              {words.map((word, index) => (
                <span
                  key={index}
                  className={`word ${selectedWords.includes(word) ? "selected" : ""}`}
                  onClick={() => handleWordClick(word)}
                >
                  {word}
                </span>
              ))}
            </div>
            {wordLimitError && (
              <p style={{ color: "red", marginTop: "10px" }}>
                You can only select up to 3 words.
              </p>
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
            🌤️ Use today’s weather
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
