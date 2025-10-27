import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Results.css";

export default function Results() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { vibePhrase, tracks: initialTracks } = state;

  const [tracks, setTracks] = useState(initialTracks || []);

  const handleRemove = (indexToRemove) => {
    setTracks(tracks.filter((_, i) => i !== indexToRemove));
  };

  const handleSaveMoodsic = () => {
    // your logic to save in moodsic (localStorage, db, etc.)
    console.log("Saved in Moodsic:", tracks);
    alert("Playlist saved in Moodsic!");
  };

  const handleSaveSpotify = () => {
    // your logic to save to Spotify via API
    console.log("Saved to Spotify:", tracks);
    alert("Playlist sent to Spotify!");
  };

  const handleChart = () => {
    navigate("/chart", { state: { tracks } });
  };

  return (
    <div className="results-container">
      <h1 className="vibe-title">{vibePhrase}</h1>

      <div className="tracks-container">
        {tracks.map((track, index) => (
          <div className="track-wrapper" key={track.url || index}>
            <div className="track-card">
              <iframe
                title={`track-${index}`}
                className="spotify-embed"
                src={`https://open.spotify.com/embed/track/${track.url.split("/").pop()}`}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
            <button
              className="remove-button"
              onClick={() => handleRemove(index)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div className="results-buttons">
        <button className="back-button" onClick={() => navigate("/")}>
          &larr; Back to Home
        </button>
        <button className="save-button moodsic" onClick={handleSaveMoodsic}>
          Save in Moodsic
        </button>
        <button className="save-button spotify" onClick={handleSaveSpotify}>
          Save to Spotify
        </button>
        <button className="see-chart" onClick={handleChart}>
          View your Mood Chart
        </button>
      </div>

    </div>
  );
}

