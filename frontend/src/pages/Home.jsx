import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import HomeUI from "./HomeUI";
import "./Home.css";
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from "../context/AppContext";
import FaceMood from "./FaceMood.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Home() {
    const [weatherData, setWeatherData] = useState(null);
    const [useWeather, setWeather] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const [selectedWords, setSelectedWords] = useState([]);
    const [wordLimitError, setWordLimitError] = useState(false);
    const [mood, setMood] = useState("");
    const [faceMood, setFaceMood] = useState("");
    const handleFaceMoodDetected = (detectedMood) => {
        console.log("Face mood detected:", detectedMood);
        setFaceMood(detectedMood);
    };

    const [useSpotifyHistory, setUseSpotifyHistory] = useState(false);
    const [spotifyTopArtists, setSpotifyTopArtists] = useState([]);
    const [spotifyGenres, setSpotifyGenres] = useState([]);

    const { accessToken, profile, setProfile, setSessionExpired } = useContext(AppContext);
    const [error, setError] = useState(null);

    const [playlist, setPlaylist] = useState([]);

    const location = useLocation();
    const navigate = useNavigate();

    // Fetch weather data if useWeather is true
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        // Call your backend endpoint instead of OpenWeather directly
                        const res = await axios.get(`https://moodsic-backend-final.vercel.app/weather?lat=${latitude}&lon=${longitude}`);
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
                    setSessionExpired(true);
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


    //Last Session
    useEffect(() => {
        const fetchLastSession = async () => {
            if (!profile?.email) return;

            try {
                const res = await axios.post("https://moodsic-backend-final.vercel.app/get-session", {
                    email: profile.email,
                });

                if (res.data.success && res.data.data) {
                    const session = res.data.data;
                    setMood(session.mood || "");
                    // Parse selected_words if it's a string
                    let words = session.selected_words;
                    if (typeof words === "string") {
                        try {
                            words = JSON.parse(words);
                        } catch {
                            // If parsing fails, try Postgres array format or comma-separated
                            if (words.startsWith("{") && words.endsWith("}")) {
                                const inner = words.slice(1, -1);
                                const parts = inner.match(/(?:[^,"]+|"[^"]*")+/g) || [];
                                words = parts.map((p) => p.replace(/^"|"$/g, "").trim());
                            } else if (words.includes(",")) {
                                words = words.split(",").map((w) => w.trim());
                            } else {
                                words = words ? [words] : [];
                            }
                        }
                    }
                    setSelectedWords(Array.isArray(words) ? words : []);
                    // Optionally store playlist tracks for Spotify history
                    setPlaylist(session.songs || []);
                }
            } catch (err) {
                // First time login - no session exists yet, that's okay
                if (err.response?.status !== 404) {
                    console.error("Failed to fetch last session:", err);
                }
            }
        };

        fetchLastSession();
    }, [profile?.email]);

    // Word Cloud selection
    const handleWordClick = (word) => {
        setWordLimitError(false); // reset previous error

        if (selectedWords.includes(word)) {
            // unselect word
            setSelectedWords((prev) => prev.filter((item) => item !== word));
        } else if (selectedWords.length < 3) {
            // add new word
            setSelectedWords((prev) => [...prev, word]);
        } else {
            // show red inline error instead of alert
            setWordLimitError(true);
        }
    };


    // Generate vibe & playlist
    const handleGenerate = React.useCallback(async () => {
        try {
            console.log("Mood:", mood);
            console.log("Selected Words:", selectedWords);
            console.log("Face Mood:", faceMood);
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
                faceMood: faceMood || "",
                weather: useWeather && weatherData
                    ? {
                        temp: weatherData?.main?.temp ?? null,
                        description: weatherData?.weather?.[0]?.description ?? "",
                    }
                    : null,

                // Make Spotify data safe
                spotifyGenres: useSpotifyHistory ? spotifyGenres || [] : [],
                spotifyTopArtists: useSpotifyHistory ? spotifyTopArtists || [] : [],

                accessToken, // Only send once
            };

            console.log("Payload to AI/backend:", payload);

            // Call backend
            const response = await axios.post(
                "https://moodsic-backend-final.vercel.app/generatePlaylist",
                payload
            );

            console.log("Backend response:", response.data);

            const { vibePhrase, tracks } = response.data;

            // Navigate to results
            navigate("/generating", {
                state: {
                    vibePhrase,
                    mood,
                    faceMood,
                    selectedWords,
                    usedWeather: !!weatherData,
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
            toast.error("❌ Something went wrong while generating your vibe. Try again!");
        }
    });

    useEffect(() => {
        if (location.state) {
            if (location.state.mood) setMood(location.state.mood);
            if (location.state.selectedWords) setSelectedWords(location.state.selectedWords);
            if (location.state.usedWeather) setWeather(true);
            if (location.state.usedSpotify) setUseSpotifyHistory(true);
        }
    }, [location.state]);


    return (
        <>
            <FaceMood onMoodDetected={handleFaceMoodDetected} />
            <HomeUI
                selectedWords={selectedWords}
                wordLimitError={wordLimitError}
                handleWordClick={handleWordClick}
                useWeather={useWeather}
                setWeather={setWeather}
                useSpotifyHistory={useSpotifyHistory}
                setUseSpotifyHistory={setUseSpotifyHistory}
                locationError={locationError}
                weatherData={weatherData}
                handleGenerate={handleGenerate}
                mood={mood}
                setMood={setMood}
                faceMood={faceMood}
                setFaceMood={setFaceMood}
                error={error}
                spotifyTopArtists={spotifyTopArtists}
                spotifyGenres={spotifyGenres}
            />

            {/* Toast container for global notifications */}
            <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
        </>
    );
}

export default Home;
