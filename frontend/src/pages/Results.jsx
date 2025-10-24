import { useLocation, useNavigate } from "react-router-dom";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { vibePhrase, mood, selectedWords, usedWeather, usedPersonality, usedSpotify, tracks } = location.state;

  return (
    <div className="results-wrapper">
      <h1>Your Vibe: ✨ {vibePhrase} ✨</h1>

      <div className="user-input-summary">
        <p><strong>Mood input:</strong> {mood || "None"}</p>
        <p><strong>Words chosen:</strong> {selectedWords.length > 0 ? selectedWords.join(", ") : "None"}</p>
        <p><strong>Used Weather:</strong> {usedWeather ? "Yes" : "No"}</p>
        <p><strong>Used Personality Quiz:</strong> {usedPersonality ? "Yes" : "No"}</p>
        <p><strong>Used Spotify History:</strong> {usedSpotify ? "Yes" : "No"}</p>
      </div>

      <hr />

      <div className="playlist-container">
        <h2>Generated Playlist</h2>
        {tracks && tracks.length > 0 ? (
          tracks.map((track) => (
            <div key={track.id} className="track">
              <p>{track.title} - {track.artist}</p>
              {track.preview_url && (
                <audio controls>
                  <source src={track.preview_url} type="audio/mpeg" />
                </audio>
              )}
            </div>
          ))
        ) : (
          <p>No tracks found.</p>
        )}
      </div>

      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}
