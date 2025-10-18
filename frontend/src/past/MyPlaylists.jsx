import React, { useEffect, useState } from 'react';

function MyPlaylists() {
  const [savedPlaylists, setSavedPlaylists] = useState([]);

  useEffect(() => {
    fetchSaved();
  }, 
  
  []);

  const fetchSaved = () => {
    const saved = localStorage.getItem('myPlaylists');
    if (saved) {
      setSavedPlaylists(JSON.parse(saved));
    } else {
      setSavedPlaylists([]);
    }
  };

    const handleClear = () => {
    localStorage.removeItem('myPlaylists');
    setSavedPlaylists([]);
  };


return (
  <div style={{ padding: 20 }}>
    <h1>My Playlists</h1>

    <div style={{ marginBottom: 16 }}>
      <p>{savedPlaylists.length} saved playlist{savedPlaylists.length !== 1 ? 's' : ''}</p>
    </div>

    {savedPlaylists.length === 0 ? (
      <p>No saved playlists yet.</p>
    ) : (
      <>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {savedPlaylists.map((s, i) => (
            <div
              key={s.url || i}
              style={{
                width: 220,
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 8,
              }}
            >
              {s.image && (
                <img
                  src={s.image}
                  alt={s.name}
                  style={{ width: '100%', borderRadius: 6 }}
                />
              )}
              <h3 style={{ fontSize: 16, margin: '8px 0' }}>{s.name}</h3>
              <p style={{ fontSize: 12, height: 36, overflow: 'hidden' }}>
                {s.description || 'No description'}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 8,
                }}
              >
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1DB954', textDecoration: 'none' }}
                >
                  Open in Spotify
                </a>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: 'left' }}>
          <button
            onClick={handleClear}
            style={{
              padding: '8px 12px',
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Clear All
          </button>
        </div>
      </>
    )}
  </div>
);
}
export default MyPlaylists;
