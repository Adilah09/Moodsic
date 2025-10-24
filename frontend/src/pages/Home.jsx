import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import HomeUI from "./HomeUI";
import "./Home.css";
import { useNavigate } from 'react-router-dom';
import { AppContext } from "../context/AppContext";

function Home() {
    const [weatherData, setWeatherData] = useState(null);
    const [useWeather, setWeather] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const [usePersonality, setUsePersonality] = useState(false);
    const [personalityVector, setPersonalityVector] = useState(null); // Will be filled later

    const [selectedWords, setSelectedWords] = useState([]);
    const [wordLimitError, setWordLimitError] = useState(false);
    const [mood, setMood] = useState("");

    const [useSpotifyHistory, setUseSpotifyHistory] = useState(false);
    const [spotifyTopArtists, setSpotifyTopArtists] = useState([]);

    const [spotifyGenres, setSpotifyGenres] = useState([]);

    const { accessToken, setProfile } = useContext(AppContext);
    const [error, setError] = useState(null);

    const [vibePhrase, setVibePhrase] = useState("");
    const [playlist, setPlaylist] = useState([]); // array of track objects

    const words = [
        "Joy", "Sadness", "Excitement", "Chill", "Energy", "Peace", "Anger", "Happiness",
        "Motivation", "Relax", "Adventure", "Calm", "Fun", "Vibes", "Love", "Surprise", "Surreal"
    ];

    // Fetch weather data if useWeather is true
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        // Call your backend endpoint instead of OpenWeather directly
                        const res = await axios.get(`http://localhost:8888/api/weather?lat=${latitude}&lon=${longitude}`);
                        setWeatherData(res.data);
                    } catch (err) {
                        console.error(err);
                    }
                },
                () => setLocationError("Could not get your location."),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setLocationError("Geolocation not supported.");
        }
    }, []);

    // Fetch Spotify profile to verify token
    useEffect(() => {
        if (!accessToken) return;

        const fetchProfile = async () => {
            try {
                const res = await axios.get("https://api.spotify.com/v1/me", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                console.log("Fetched profile:", res.data);
                setProfile(res.data);
            } catch (err) {
                console.error("Spotify fetch failed", err);
                if (err.response?.status === 401) {
                    setError("Session expired, please log in again.");
                } else if (err.response?.status === 403) {
                    setError("⚠️ Some features require Spotify Premium.");
                } else {
                    setError("Failed to fetch profile.");
                }
            }
        };

        fetchProfile();
    }, [accessToken, setProfile]);


    // Fetch Spotify Top Artists if toggle is on
    useEffect(() => {
        if (!useSpotifyHistory || !accessToken) return;

        const fetchTopArtists = async () => {
            try {
                const res = await axios.get("https://api.spotify.com/v1/me/top/artists?limit=10", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setSpotifyTopArtists(res.data.items);

                // Extract genres right after fetching
                if (res.data.items && res.data.items.length > 0) {
                    const genres = [...new Set(res.data.items.flatMap(artist => artist.genres))];
                    setSpotifyGenres(genres);
                }
            } catch (err) {
                console.error("Failed to fetch Spotify top artists", err);
            }
        };

        fetchTopArtists();
    }, [useSpotifyHistory, accessToken]);


    // Word Cloud selection
    const handleWordClick = (word) => {
        if (selectedWords.includes(word)) {
            setSelectedWords(prev => prev.filter(item => item !== word));
            setWordLimitError(false);
        } else if (selectedWords.length < 3) {
            setSelectedWords(prev => [...prev, word]);
        } else {
            setWordLimitError(true);
        }
    };

    const navigate = useNavigate();

    // Generate vibe & playlist
    const handleGenerate = async () => {
        try {
            console.log("Mood:", mood);
            console.log("Selected Words:", selectedWords);
            if (useWeather && weatherData) console.log("Weather Data:", weatherData);
            if (useSpotifyHistory && spotifyGenres.length > 0) console.log("Spotify Genres:", spotifyGenres);

            // Payload for vibe phrase generation
            const payload = {
                mood,
                selectedWords,
                weather: weatherData
                    ? { temp: weatherData.main.temp, description: weatherData.weather[0].description }
                    : null,
                personalityVector,
                spotifyGenres: useSpotifyHistory ? spotifyGenres : null,
            };

            console.log("Payload to AI:", payload);

            // 1️⃣ Get vibe phrase from backend
            const { data: { vibePhrase } } = await axios.post("/api/getVibePhrase", payload);

            // 2️⃣ Generate playlist using Spotify Recommendations API
            const { data: { tracks } } = await axios.post("/api/generatePlaylist", {
                vibePhrase,
                spotifyGenres: spotifyGenres || [],
                accessToken,
            });

            // 3️⃣ Navigate to results page
            navigate("/results", {
                state: {
                    vibePhrase,
                    mood,
                    selectedWords,
                    usedWeather: !!weatherData,
                    usedPersonality: !!personalityVector,
                    usedSpotify: useSpotifyHistory,
                    tracks,
                },
            });

        } catch (err) {
            console.error("Failed to generate vibe & playlist:", err.response?.data || err);
            alert("Oops! Something went wrong while generating your vibe. Please try again.");
        }
    };

    return (
        <HomeUI
            words={words}
            selectedWords={selectedWords}
            wordLimitError={wordLimitError}
            handleWordClick={handleWordClick}
            useWeather={useWeather}
            setWeather={setWeather}
            usePersonality={usePersonality}
            setUsePersonality={setUsePersonality}
            useSpotifyHistory={useSpotifyHistory}
            setUseSpotifyHistory={setUseSpotifyHistory}
            locationError={locationError}
            weatherData={weatherData}
            handleGenerate={handleGenerate}
            mood={mood}
            setMood={setMood}
            error={error}
        />
    );
}

export default Home;
