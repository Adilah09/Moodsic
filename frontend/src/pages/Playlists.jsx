import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Playlists.css";

export default function Playlists() {
  const [playlistData, setPlaylistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    async function fetchPlaylist() {
      try {
        if (!email) {
          setError("No user email found.");
          setLoading(false);
          return;
        }

        const response = await axios.post(
          "https://moodsic-backend.vercel.app/get-session",
          { email }
        );

        if (response.data.success && response.data.data) {
          let data = response.data.data;
          // Ensure songs are parsed if stored as text in DB
          if (typeof data.songs === "string") {
            try {
              data.songs = JSON.parse(data.songs);
            } catch {
              data.songs = [];
            }
          }
          setPlaylistData(data);
        } else {
          setPlaylistData(null);
        }
      } catch (err) {
        console.error("Error fetching saved playlist:", err);
        setError("Failed to load playlist.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlaylist();
  }, [email]);

  const handleClearAll = async () => {
    try {
      const response = await axios.post(
        "https://moodsic-backend.vercel.app/clear-session",
        { email }
      );
      if (response.data.success) {
        alert("✨ Playlist cleared successfully!");
        setPlaylistData(null);
      } else {
        alert("Failed to clear playlist.");
      }
    } catch (err) {
      console.error("Error clearing playlist:", err);
      alert("Something went wrong while clearing your playlist.");
    }
  };

  if (loading)
    return <div className="playlist-loading">Loading your playlist...</div>;
  if (error) return <div className="playlist-error">{error}</div>;
  if (!playlistData)
    return (
      <div className="empty-state">
        You haven’t saved any playlists yet.
      </div>
    );

  return (
    <div className="playlist-page">
      <h2>
        {playlistData.mood
          ? `${playlistData.mood} vibes 🎶`
          : "Your Saved Playlist"}
      </h2>
      <p className="playlist-subtitle">
        "{playlistData.selected_words?.join(", ")}"
      </p>

      <div className="playlist-container">
        {playlistData.songs.map((song, index) => (
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

      <button className="clear-btn" onClick={handleClearAll}>
        Clear All Songs
      </button>
    </div>
  );
}
