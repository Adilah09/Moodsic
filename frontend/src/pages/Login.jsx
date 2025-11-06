import React, { useEffect, useState, useContext, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


//Login to Spotify
const Login = () => {
  const { setAccessToken } = useContext(AppContext);
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (error === "access_denied") {
      toast.warn("🚫 You cancelled Spotify login. Please try again!");
      window.history.replaceState({}, document.title, "/");
      return;
    }
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      setAccessToken(accessToken);
      navigate("/home", { replace: true });
    }
  }, [setAccessToken, navigate]);

  const handleLogin = () => {
    window.location.href = "http://moodsic-backend.vercel.app/login";
  };

  useEffect(() => {
    fetch("https://moodsic-backend.vercel.app/api/sotd")
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

  // Parallax effect
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

  // Floating musical note trail
  useEffect(() => {
    const container = document.createElement("div");
    container.id = "note-container";
    document.body.appendChild(container);

    let lastSpawn = 0;
    const notes = ["🎵", "🎶", "🎼"];

    const spawnNote = (e) => {
      const now = Date.now();
      if (now - lastSpawn < 120) return;
      lastSpawn = now;

      const note = document.createElement("div");
      note.className = "note-float";
      note.textContent = notes[Math.floor(Math.random() * notes.length)];
      note.style.left = `${e.pageX + (Math.random() * 30 - 15)}px`;
      note.style.top = `${e.pageY + (Math.random() * 30 - 15)}px`;
      container.appendChild(note);
      setTimeout(() => note.remove(), 2000);
    };

    window.addEventListener("mousemove", spawnNote);
    return () => {
      window.removeEventListener("mousemove", spawnNote);
      container.remove();
    };
  }, []);

  // 3D tilt effect
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

  // Swipe handlers
  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe && activeSlide === 0) setActiveSlide(1);
    if (isRightSwipe && activeSlide === 1) setActiveSlide(0);
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="login-wrapper">
      <div className="spotlight"></div>

      <ul className="particles">{[...Array(20)].map((_, i) => <li key={i}></li>)}</ul>
      <ul className="music-notes">
        {["🎵", "🎶", "🎼", "🎵", "🎶"].map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ul>

      {/* Mobile Carousel */}
      <div
        className="mobile-carousel"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`carousel-track ${activeSlide === 1 ? "slide-right" : ""}`}>
          {/* Slide 1 — Login */}
          <div className="carousel-slide">
            <div className="login-panel slide-in">
              <h1>
                Welcome to <span className="highlight">Moodsic</span>
              </h1>
              <p className="subtitle">Feel the rhythm of your mood, your personality and the weather — discover music that moves with you.</p>
              <button className="spotify-btn" onClick={handleLogin}>
                Login with Spotify
              </button>
              <p className="swipe-hint">⬅ Swipe to see the Song of the Day ➡</p>
            </div>
          </div>

          {/* Slide 2 — Song of the Day */}
          <div className="carousel-slide">
            <div className="song-section fade-in">
              <div className="song-card mx-auto">
                {loading ? (
                  <p className="loading">Loading Song of the Day...</p>
                ) : (
                  <>
                    <div className="hero-section">
                      <h3 className="sotd-badge">✨ Song of the Day</h3>
                      <img
                        src={song.albumArt}
                        alt={song.title}
                        className="album-art img-fluid mx-auto d-block glow mb-3"
                      />
                      <div className="song-info">
                        <h1>{song.title}</h1>
                        <p>{song.artist}</p>
                      </div>
                    </div>
                    <div className="player-section">
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
                        <iframe
                          src={
                            song.link
                              ? song.link.replace(
                                  "open.spotify.com/track",
                                  "open.spotify.com/embed/track"
                                )
                              : ""
                          }
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="spotify-embed w-100"
                        ></iframe>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="carousel-dots">
          <span
            className={`dot ${activeSlide === 0 ? "active" : ""}`}
            onClick={() => setActiveSlide(0)}
          ></span>
          <span
            className={`dot ${activeSlide === 1 ? "active" : ""}`}
            onClick={() => setActiveSlide(1)}
          ></span>
        </div>
      </div>

      {/* Desktop layout unchanged */}
      <div className="desktop-layout">
        <div className="song-section fade-in">
          <div className="song-card mx-auto">
            {loading ? (
              <p className="loading">Loading Song of the Day...</p>
            ) : (
              <>
                <div className="hero-section">
                  <h3 className="sotd-badge">✨ Song of the Day</h3>
                  <img
                    src={song.albumArt}
                    alt={song.title}
                    className="album-art img-fluid mx-auto d-block glow mb-3"
                  />
                  <div className="song-info">
                    <h1>{song.title}</h1>
                    <p>{song.artist}</p>
                  </div>
                </div>
                <div className="player-section">
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
                    <iframe
                      src={
                        song.link
                          ? song.link.replace(
                              "open.spotify.com/track",
                              "open.spotify.com/embed/track"
                            )
                          : ""
                      }
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="spotify-embed w-100"
                    ></iframe>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="login-panel slide-in">
          <h1>
            Welcome to <span className="highlight">Moodsic</span>
          </h1>
          <p className="subtitle">Feel the rhythm of your mood, your personality and the weather — discover music that moves with you.</p>
          <button className="spotify-btn" onClick={handleLogin}>
            Login with Spotify
          </button>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </div>
  );
};

export default Login;
