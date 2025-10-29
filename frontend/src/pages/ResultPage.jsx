import React, { useEffect, useRef } from "react";

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
          <button className="btn restart-btn" onClick={onRestart}>
            Take the Quiz Again
          </button>
        )}
      </div>
    </div>
  );
}
