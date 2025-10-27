// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./Home.css";

// function Home() {
//   const [selectedMood, setSelectedMood] = useState(null);
//   const [useWeather, setWeather] = useState(false);
//   const [usePersonality, setUsePersonality] = useState(false);
//   const [locationError, setLocationError] = useState(null);

//   const moods = [
//     { label: "😎 Chill", value: "chill" },
//     { label: "😃 Happy", value: "happy" },
//     { label: "😢 Sad", value: "sad" },
//     { label: "🔥 Energetic", value: "energetic" },
//     { label: "💤 Lazy", value: "lazy" },
//   ];

//   const handleMoodClick = (mood) => setSelectedMood(mood);

//   useEffect(() => {
//     if ("geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const { latitude, longitude } = position.coords;
//           try {
//             const res = await axios.get("/api/weather", {
//               params: { lat: latitude, lon: longitude },
//             });
//             setWeather(res.data);
//           } catch (err) {
//             console.error(err);
//           }
//         },
//         (error) => setLocationError("Could not get your location."),
//         { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
//       );
//     } else {
//       setLocationError("Geolocation not supported.");
//     }
//   }, []);

//   const handleGenerate = async () => {
//   console.log("Mood:", selectedMood);
//   console.log("Use Personality Quiz:", usePersonality);
//   // pass mood + weatherData + personality vector to your AI
// };
//   return (
//     <div className="mood-wrapper">
//       <div className="mood-card">
//         <h1>What's your vibe today?</h1>
//         <p className="subtitle">Tap your current mood or choose a surprise!</p>

//         {/* Mood input grid */}
//         <div className="mood-grid">
//           {moods.map((mood) => (
//             <button
//               key={mood.value}
//               className={`mood-btn ${selectedMood === mood.value ? "active" : ""}`}
//               onClick={() => handleMoodClick(mood.value)}
//             >
//               {mood.label}
//             </button>
//           ))}
//         </div>

//         {/* Optional Toggles */}
//         <div className="optional-toggles">
//           <label>
//             <input
//               type="checkbox"
//               checked={useWeather}
//               onChange={() => setWeather(!useWeather)}
//             />
//             Use Weather
//           </label>
//           <label>
//             <input
//               type="checkbox"
//               checked={usePersonality}
//               onChange={() => setUsePersonality(!usePersonality)}
//             />
//             Personality Quiz
//           </label>
//         </div>

//         {/* Mood Options */}
//         <div className="mood-options">
//           <button className="option-btn" onClick={() => console.log("Surprise Me!")}>
//             Use my Spotify Data
//           </button>
//           <button
//             className="option-btn"
//             onClick={() => console.log("Based on My Vibe!")}
//           >
//             Fresh Moods
//           </button>
//         </div>

//         {/* Generate Playlist */}
//         <button
//           id="submit-btn"
//           disabled={!selectedMood}
//           onClick={handleGenerate}
//         >
//           Generate My Vibe 🎶
//         </button>

//             <div>
//       {locationError && <p>{locationError}</p>}
//       {setWeather ? (
//         <div>
//           <p>Temp: {setWeather.temp}°C</p>
//           <p>Description: {setWeather.description}</p>
//         </div>
//       ) : (
//         <p>Loading weather...</p>
//       )}

//     </div>
//       </div>
//     </div>
//   );
// }

// export default Home;




// import React, { useState } from 'react';


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
//   const [showWordCloud, setShowWordCloud] = useState(false);
//   const [showWeather, setShowWeather] = useState(false);
//   return (
//     <div className="mood-wrapper">
//       {/* Welcome Box outside of the mood-card */}
//       <div className="mood-card">
//         <div className="welcome-box">
//           <h1>Welcome to Moodsic!</h1>
//           <p>Moodsic: Navigating the vast world of music</p>
//           <p>Discover playlists tailored to your mood, personality, or even today's weather.</p>
//           <p><strong>Your personalized playlist generator based on your vibe!</strong></p>  {/* New tagline */}
//         </div>
//       </div>

//       <div className="mood-card">
//         <h2>Step 1: Tell us your mood</h2>
//         <p>Select your current mood or vibe to get started.</p>
//         {/* <div className="mood-input-container"> */}
//           {/* Mood Input */}
//           {/* <h1>💗 How are you feeling right now?</h1>
//           <p className="subtitle">Tell us your vibe of the day 🎧</p>
//           <input
//             type="text"
//             id="mood-input"
//             placeholder="e.g. happy, calm, tired"
//             value={mood}
//             onChange={(e) => setMood(e.target.value)}
//             style={{ padding: "8px", width: "100%", fontSize: "16px", borderRadius: "6px", border: "1px solid #ccc" }}
//           />
//         </div> */}

//       <div className="mood-input-container">
//         <input
//           type="text"
//           id="mood-input"
//           placeholder="e.g. happy, calm, tired"
//           value={mood}
//           onChange={(e) => setMood(e.target.value)}
//         />
//       </div>
//       </div>
//       <div className="mood-card">
//         <h2>Step 2: Pick your playlist generation method</h2>
//         <p>Choose one or more options to generate your playlist.</p>
//         <button onClick={() => setShowWordCloud(!showWordCloud)} 
//           title="Select words that match your mood to generate a playlist">
//           Word Cloud
//         </button>

//         <button onClick={() => setShowWeather(!showWeather)} 
//           title="Use the weather to influence your playlist">
//           Weather
//         </button>

//         <button 
//           title="Use your Spotify history to create a playlist" >
//           History
//         </button>
//         {/* Word Selection */}
//         {showWordCloud && (
//           <div className="word-selection-container">
//             <h1>Pick Your Words</h1>
//             <p className="subtitle">Click on the words that match your vibe <br /> (Max 3 words)</p>

//             <div className="wordcloudalign">
//               <div id="wordCloudContainer">
//                 <div id="wordCloud">
//                   {words.map((word, index) => (
//                     <span
//                       key={index}
//                       className={`word ${selectedWords.includes(word) ? "selected" : ""}`}
//                       onClick={() => handleWordClick(word)}
//                       style={{
//                         cursor: "pointer",
//                         padding: "5px",
//                         fontSize: "18px",
//                         margin: "5px",
//                         display: "inline-block",
//                       }}
//                     >
//                       {word}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Selected Words */}
//             <div
//               id="selectedWords"
//               style={{
//                 display: selectedWords.length ? "block" : "none",
//                 marginTop: "20px",
//                 border: "2px solid #ddd",
//                 padding: "10px",
//                 borderRadius: "8px",
//               }}
//             >
//               {selectedWords.length > 0
//                 ? selectedWords.map((word, index) => (
//                     <span key={index} style={{ padding: "5px", fontWeight: "bold" }}>
//                       {word}
//                     </span>
//                   ))
//                 : <p>No words selected.</p>}
//             </div>

//             {wordLimitError && (
//               <p style={{ color: "red", marginTop: "10px" }}>You can only select up to 3 words.</p>
//             )}
//           </div>
//         )}

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
//                   <span key={index} style={{ padding: "5px", fontWeight: "bold" }}>
//                     {word}
//                   </span>
//                 ))
//               : <p>No words selected.</p>}
//           </div>

//           {wordLimitError && (
//             <p style={{ color: "red", marginTop: "10px" }}>You can only select up to 3 words.</p>
//           )}
//         </div>

//         <hr />

//         {/* Optional Toggles */}
//         {/* Optional Toggles
//         <br />
//         <div className="optional-toggles" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//           <label>
//             <input type="checkbox" checked={useWeather} onChange={() => setWeather(!useWeather)} />
//             Use Weather
//           </label>
//           <label>
//             <input type="checkbox" checked={usePersonality} onChange={() => setUsePersonality(!usePersonality)} />
//             Personality Quiz
//           </label>
//           <label>
//             <input type="checkbox" checked={useSpotifyHistory} onChange={() => setUseSpotifyHistory(!useSpotifyHistory)} />
//             Use Spotify History
//           </label>
//         </div> */}

//         {/* Weather Display */}
//         {showWeather && (
//         <div style={{ marginTop: "20px" }}>
//           {locationError && <p>{locationError}</p>}
//           {weatherData ? (
//             <div>
//               <p>Temperature: {weatherData.main.temp}°C</p>
//               <p>Description: {weatherData.weather[0].description}</p>
//               <img
//                 src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
//                 alt={weatherData.weather[0].description}
//               />
//             </div>
//           ) : (
//             <p>Loading weather...</p>
//           )}
//         </div>
//         )}

//         <br />
//         {/* Generate Button */}
//         <button
//           id="submit-btn"
//           onClick={handleGenerate}
//           disabled={selectedWords.length === 0 && !mood} // require either a mood or words
//           style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
//         >
//           Generate My Vibe 🎶
//         </button>
//       </div>

//   );
// }
