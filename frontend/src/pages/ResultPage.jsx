import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";

function SpotifyEmbed({ uriOrId }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !uriOrId) return;

    const isTrack = uriOrId.includes("track:");
    const type = isTrack ? "track" : "playlist";
    // if a bare playlist id like "37i9..." is passed, use it directly; if a full uri "spotify:track:..." split it
    const id = isTrack ? uriOrId.split(":")[2] : uriOrId;

    containerRef.current.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = `https://open.spotify.com/embed/${type}/${id}`;
    iframe.width = "100%";
    iframe.height = isTrack ? "80" : "380";
    iframe.frameBorder = "0";
    iframe.allow = "encrypted-media";
    iframe.style.borderRadius = "8px";
    containerRef.current.appendChild(iframe);
  }, [uriOrId]);

  return <div className="spotify-player" ref={containerRef} />;
}

export default function ResultPage({ result, showRestart = false, onRestart }) {
  const navigate = useNavigate();
  const { profile } = useContext(AppContext);
  const [lastSession, setLastSession] = useState(null);

  // Fetch last session when component mounts
  useEffect(() => {
    const fetchLastSession = async () => {
      if (!profile?.email) return;

      try {
        const res = await axios.post("https://moodsic-backend.vercel.app/get-session", {
          email: profile.email,
        });

        if (res.data.success && res.data.data) {
          setLastSession(res.data.data);
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

  // Save personality to database
  useEffect(() => {
    const savePersonality = async () => {
      if (!profile?.email || !result?.title) return;

      try {
        const response = await axios.post("https://moodsic-backend.vercel.app/save-personality", {
          email: profile.email,
          name: profile.name || "Guest",
          personality_type: result.title,
        });
        console.log("✅ Personality saved:", response.data);
      } catch (error) {
        console.error("❌ Failed to save personality:", error);
      }
    };

    savePersonality();
  }, [profile, result]);

  return (
    <div className="page active">
      <div className="result">
        <h2 className="result-title">{result.title}</h2>

        <div className="image-container">
          <img src={result.image} alt={result.title} className="result-image" />
        </div>

        <div
          style={{
            backgroundColor: result.color,
            padding: 18,
            borderRadius: 10,
            margin: "15px 0",
          }}
        >
          <div className="result-description">
            <p>{result.description}</p>
          </div>
        </div>

        <div className="extra-info">
          <div className="info-box">
            <h3>Your Signature Playlist</h3>
            <p>Listen to your personalized playlist on Spotify:</p>
            <SpotifyEmbed uriOrId={result.songs?.[0]} />
          </div>

          <div className="info-box">
            <h3>What Others Say About You</h3>
            {result.comments?.map((c, i) => (
              <div className="comment-bubble" key={i}>
                <div className="comment-author">{c.author}:</div>
                <div>{c.text}</div>
              </div>
            ))}
          </div>

          <div className="info-box">
            <h3>Your Hidden Talent</h3>
            <p>{result.talent}</p>
          </div>
        </div>

        {showRestart && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <button className="btn restart-btn" onClick={onRestart}>
              Take the Quiz Again
            </button>
            <button className="btn home-btn" onClick={() => navigate('/home')}>
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

