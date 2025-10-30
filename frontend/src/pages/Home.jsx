import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import HomeUI from "./HomeUI";
import "./Home.css";
import { useNavigate, useLocation } from 'react-router-dom';
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

    const location = useLocation();
    const navigate = useNavigate();

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
                }
                else {
                    setError("Failed to fetch profile.");
                }
            }
        };

        fetchProfile();
    }, [accessToken, setProfile]);

    // Fetch Spotify Top Artists & Genres
    useEffect(() => {
        if (!useSpotifyHistory || !accessToken) return;

        const fetchSpotifyData = async () => {
            try {
                const res = await axios.get("https://api.spotify.com/v1/me/top/artists?limit=10", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                const artists = res.data.items || [];
                setSpotifyTopArtists(artists.map(a => a.name)); // Top artist names

                // Aggregate genres from top artists
                const genres = [...new Set(artists.flatMap(a => a.genres))];
                setSpotifyGenres(genres);

                console.log("Spotify top artists:", artists.map(a => a.name));
                console.log("Spotify genres:", genres);
            } catch (err) {
                console.error("Failed to fetch Spotify top artists/genres:", err);
            }
        };

        fetchSpotifyData();
    }, [useSpotifyHistory, accessToken]);

    // Word Cloud selection
    const handleWordClick = (word) => {
        if (selectedWords.includes(word)) {
            setSelectedWords(prev => prev.filter(item => item !== word));
        } else if (selectedWords.length < 3) {
            setSelectedWords(prev => [...prev, word]);
        } else {
            alert("You can select up to 3 words");
        }
    };

    // Generate vibe & playlist
    const handleGenerate = React.useCallback(async () => {
        try {
            console.log("Mood:", mood);
            console.log("Selected Words:", selectedWords);
            if (useWeather && weatherData) console.log("Weather Data:", weatherData);
            if (useSpotifyHistory) {
                console.log("Spotify Genres:", spotifyGenres);
                console.log("Spotify Top Artists:", spotifyTopArtists);
            }

            // Build payload safely for backend
            console.log("Current spotifyGenres state:", spotifyGenres);
            const payload = {
                mood: mood || "",
                selectedWords: selectedWords || [],
                weather: useWeather && weatherData
                    ? {
                        temp: weatherData?.main?.temp ?? null,
                        description: weatherData?.weather?.[0]?.description ?? "",
                    }
                    : null,
                personalityVector: personalityVector || {},

                // Make Spotify data safe
                spotifyGenres: useSpotifyHistory ? spotifyGenres || [] : [],
                spotifyTopArtists: useSpotifyHistory ? spotifyTopArtists || [] : [],

                accessToken, // Only send once
            };

            console.log("Payload to AI/backend:", payload);

            // Call backend
            const response = await axios.post(
                "http://localhost:8888/api/generatePlaylist",
                payload
            );

            console.log("Backend response:", response.data);

            const { vibePhrase, tracks } = response.data;

            // Navigate to results
            navigate("/results", {
                state: {
                    vibePhrase,
                    mood,
                    selectedWords,
                    usedWeather: !!weatherData,
                    usedPersonality: !!personalityVector,
                    usedSpotify: useSpotifyHistory,
                    tracks: tracks.length ? tracks : [{
                        name: "No tracks found",
                        artist: "",
                        url: "",
                        image: ""
                    }],
                },
            });
        } catch (err) {
            console.error(
                "Failed to generate vibe & playlist:",
                err.response?.data || err
            );
            alert(
                "Oops! Something went wrong while generating your vibe. Please try again."
            );
        }
    });

    useEffect(() => {
        if (location.state) {
            if (location.state.mood) setMood(location.state.mood);
            if (location.state.selectedWords) setSelectedWords(location.state.selectedWords);
            if (location.state.usedWeather) setWeather(true);
            if (location.state.usedPersonality) setUsePersonality(true);
            if (location.state.usedSpotify) setUseSpotifyHistory(true);
        }
    }, [location.state]);


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
