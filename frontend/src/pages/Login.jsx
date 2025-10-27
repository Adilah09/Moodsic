import React, { useEffect, useState, useContext, useRef } from "react";
import { AppContext } from "../context/AppContext";
import "./Login.css";

//Login to Spotify
const Login = () => {
  const { setAccessToken } = useContext(AppContext);
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      setAccessToken(accessToken);
      window.history.replaceState({}, document.title, "/home");
      window.location.href = "/home";
    }
  }, [setAccessToken]);

  // Fetch Song of the Day on mount
  useEffect(() => {
    fetch("http://127.0.0.1:8888/api/sotd")
      .then((res) => res.json())
      .then((data) => setSong(data))
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };
  
   // 🎆 Parallax effect for particles and notes
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      document.querySelectorAll(".particles li, .music-notes li").forEach((el) => {
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // fetch Song of the Day (backend already guarantees preview_url)
  const fetchSOTD = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const res = await fetch(`http://127.0.0.1:8888/api/sotd?d=${today}`, { cache: "no-store" });
      if (!res.ok) throw new Error("SOTD fetch failed");
      const data = await res.json();
      setSong(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🎶 Floating musical note trail
useEffect(() => {
  const container = document.createElement("div");
  container.id = "note-container";
  document.body.appendChild(container);

  let lastSpawn = 0;
  const notes = ["🎵", "🎶", "🎼"];

  const spawnNote = (e) => {
    const now = Date.now();
    if (now - lastSpawn < 120) return; // limit spawn rate
    lastSpawn = now;

    const note = document.createElement("div");
    note.className = "note-float";
    note.textContent = notes[Math.floor(Math.random() * notes.length)];

    // position near cursor
    note.style.left = `${e.pageX + (Math.random() * 30 - 15)}px`;
    note.style.top = `${e.pageY + (Math.random() * 30 - 15)}px`;

    container.appendChild(note);

    // remove after fade
    setTimeout(() => {
      note.remove();
    }, 2000);
  };

  window.addEventListener("mousemove", spawnNote);
  return () => {
    window.removeEventListener("mousemove", spawnNote);
    container.remove();
  };
}, []);

    // 💿 3D tilt effect for the song card
  useEffect(() => {
    const card = document.querySelector(".song-card");
    if (!card) return;

    const handleCardTilt = (e) => {
      const x = (window.innerWidth / 2 - e.clientX) / 30;
      const y = (window.innerHeight / 2 - e.clientY) / 30;
      card.style.transform = `rotateY(${x}deg) rotateX(${y}deg) scale(1.03)`;
    };

    const resetTilt = () => {
      card.style.transform = "rotateY(0deg) rotateX(0deg) scale(1)";
    };

    window.addEventListener("mousemove", handleCardTilt);
    window.addEventListener("mouseleave", resetTilt);

    return () => {
      window.removeEventListener("mousemove", handleCardTilt);
      window.removeEventListener("mouseleave", resetTilt);
    };
  }, []);


  return (
    <div className="login-wrapper">
      {/* 🌸 One soft glow spotlight */}
      <div className="spotlight"></div>

      {/* ✨ Floating Particles */}
      <ul className="particles">
        {[...Array(20)].map((_, i) => (
          <li key={i}></li>
        ))}
      </ul>

      {/* 🎵 Floating Music Notes */}
      <ul className="music-notes">
        {["🎵", "🎶", "🎼", "🎵", "🎶"].map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ul>

      {/* 🎧 Song of the Day */}
      <div className="song-section fade-in">
        <div className="song-card">
          {loading ? (
            <p className="loading">Loading Song of the Day...</p>
          ) : (
            <>
              <img src={song.albumArt} alt={song.title} className="album-art glow" />

              <div className={`waveform ${isPlaying ? "active" : ""}`}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bar"></div>
                ))}
              </div>

              <div className="song-info">
                <h3>✨ Song of the Day</h3>
                <h1>{song.title}</h1>
                <p>{song.artist}</p>

                {song.preview ? (
                  <>
                    <button
                      onClick={handlePlayPause}
                      className={`play-btn ${isPlaying ? "playing" : ""}`}
                    >
                      {isPlaying ? "⏸ Pause Preview" : "▶ Play Preview"}
                    </button>
                    <audio ref={audioRef} src={song.preview} />
                  </>
                ) : (
                  <p className="no-preview">🎧 Preview unavailable</p>
                )}

                <a
                  href={song.link}
                  target="_blank"
                  rel="noreferrer"
                  className="spotify-link"
                >
                  Listen on Spotify
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 🩷 Login Section */}
      <div className="login-panel slide-in">
        <h1>
          Welcome to <span className="highlight">Moodsic</span> 🎶
        </h1>
        <p className="subtitle">Your mood. Your music. Curated to match your vibe.</p>
        <button
          className="spotify-btn"
          onClick={() => (window.location.href = "http://127.0.0.1:8888/login")}
        >
          Login with Spotify
        </button>
      </div>
    </div>
  );
};
 

export default Login;