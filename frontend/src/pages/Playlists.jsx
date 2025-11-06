import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Playlists.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [expandedIds, setExpandedIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        if (!email) {
          setError("No user email found.");
          setLoading(false);
          return;
        }

        const response = await axios.post(
          "https://moodsic-backend.vercel.app/get-sessions",
          { email }
        );

        if (response.data.success && Array.isArray(response.data.data)) {
          const list = response.data.data.map((row) => {
            let songs = row.songs;
            if (typeof songs === "string") {
              try {
                songs = JSON.parse(songs);
              } catch {
                songs = [];
              }
            }

            let selectedWords = row.selected_words;
            if (typeof selectedWords === "string") {
              try {
                selectedWords = JSON.parse(selectedWords);
              } catch {
                // leave as raw string
              }
            }

            return { ...row, songs, selected_words: selectedWords };
          });
          setPlaylists(list);
        } else {
          setPlaylists([]);
        }
      } catch (err) {
        console.error("Error fetching saved playlists:", err);
        setError("Failed to load playlists.");
        toast.error("⚠️ Failed to load playlists.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlaylists();
  }, [email]);

  const handleClearAll = async () => {
    try {
      const response = await axios.post(
        "https://moodsic-backend.vercel.app/clear-session",
        { email }
      );
      if (response.data.success) {
        toast.success("✨ Playlist cleared successfully!");
        setPlaylistData(null);
      } else {
        toast.error("Failed to clear playlist.");
      }
    } catch (err) {
      console.error("Error clearing playlist:", err);
      toast.error("Something went wrong while clearing your playlist.");
    }
  };

  if (loading)
    return <div className="playlist-loading">Loading your playlists...</div>;
  if (error) return <div className="playlist-error">{error}</div>;
  if (!playlists.length)
    return (
      <div className="empty-state">
        You haven’t saved any playlists yet.
      </div>
    );

  return (
    <div className="playlist-page">
      <h2>Your Saved Playlists</h2>

      <div className="playlist-container">
        {playlists.map((p) => {
          const isExpanded = !!expandedIds[p.id];
          const title = p.mood || "Untitled Playlist";
          const subtitle = Array.isArray(p.selected_words)
            ? `"${p.selected_words.join(", ")}"`
            : typeof p.selected_words === "string" && p.selected_words
            ? `"${p.selected_words}"`
            : "";

        return (
            <div key={p.id} className="playlist-group">
              <button
                className="playlist-toggle"
                onClick={() =>
                  setExpandedIds((prev) => ({
                    ...prev,
                    [p.id]: !prev[p.id],
                  }))
                }
              >
                <span className="playlist-title">{title}</span>
                {subtitle && (
                  <span className="playlist-subtitle"> {subtitle}</span>
                )}
                <span className="chev">{isExpanded ? "▲" : "▼"}</span>
              </button>

              {isExpanded && (
                <div className="playlist-tracks">
                  {(p.songs || []).map((song, index) => (
                    <div key={index} className="playlist-card">
                      <img src={song.image} alt={song.name} />
                      <div className="song-info">
                        <h3>{song.name}</h3>
                        <p>{song.artist}</p>
                        <a href={song.url} target="_blank" rel="noopener noreferrer">
                          Listen on Spotify
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="clear-btn" onClick={handleClearAll}>
        Clear All Playlists
      </button>

      {/* Toast container goes at the bottom of your page */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
