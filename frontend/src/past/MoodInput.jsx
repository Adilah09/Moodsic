import React, { useState, useEffect } from 'react';

function MoodInput() {
  const [playlists, setPlaylists] = useState([]);
  const [mood, setMood] = useState('');

  const [savedPlaylists, setSavedPlaylists] = useState([]);

  useEffect(() => {
    fetchSavedPlaylists();
  }, []);

  // Load saved playlists from localStorage
  const fetchSavedPlaylists = () => {
    const saved = localStorage.getItem('myPlaylists');
    if (saved) {
      setSavedPlaylists(JSON.parse(saved));
    } else {
      setSavedPlaylists([]);
    }
  };

  // Save updated playlists to localStorage and state
  const savePlaylists = (playlists) => {
    localStorage.setItem('myPlaylists', JSON.stringify(playlists));
    setSavedPlaylists(playlists);
  };

  const handleGenerate = async () => {
    try {
      // 1️⃣ Get token from backend
      const tokenRes = await fetch('http://localhost:8888/api/token');
      const { access_token } = await tokenRes.json();

      if (!access_token) return alert('Failed to get Spotify token');

      // 2️⃣ Search playlists by mood
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(mood)}&type=playlist&limit=20`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      const data = await searchRes.json();

      if (data.playlists && data.playlists.items.length > 0) {
        // 3️⃣ Filter nulls and take top 3
        const validPlaylists = data.playlists.items
          .filter(Boolean) // remove nulls
          .slice(0, 3);

        setPlaylists(validPlaylists);
      } else {
        setPlaylists([]);
        alert('No playlists found for this mood. Try another keyword!');
      }
    } catch (err) {
      console.error('Error generating playlists:', err);
      alert('Error generating playlists. Check console for details.');
    }
  };

  // Save a playlist locally
  const handleSave = (pl) => {
    const payload = {
      name: pl.name,
      url: pl.external_urls?.spotify,
      image: pl.images && pl.images.length ? pl.images[0].url : null,
      description: pl.description || '',
      id: pl.id,
    };

    // Check for duplicates by ID to avoid adding same playlist multiple times
    const isDuplicate = savedPlaylists.some((p) => p.id === payload.id);
    if (isDuplicate) {
      alert('Playlist already saved!');
      return;
    }

    const updatedPlaylists = [...savedPlaylists, payload];
    savePlaylists(updatedPlaylists);
    alert('Playlist saved locally!');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Moodsic</h1>

      <div style={{ marginBottom: 16 }}>
        <input
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Enter mood (ex: chill, happy)"
          style={{ padding: 8, width: 300 }}
        />
        <button onClick={handleGenerate} style={{ marginLeft: 8, padding: '8px 12px' }}>Generate</button>
      </div>

      <h2>Results</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {playlists.length === 0 && <p>No playlists yet... Generate one now!</p>}
        {playlists.map(pl => (
          pl && (
            <div key={pl.id} style={{ width: 220, border: '1px solid #ddd', borderRadius: 8, padding: 8 }}>
              {pl.images && pl.images[0] && (
                <img src={pl.images[0].url} alt={pl.name} style={{ width: '100%', borderRadius: 6 }} />
              )}
              <h3 style={{ fontSize: 16, margin: '8px 0' }}>{pl.name}</h3>
              <p style={{ fontSize: 12, height: 36, overflow: 'hidden' }}>{pl.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <a href={pl.external_urls.spotify} target="_blank" rel="noopener noreferrer">Open</a>
                <button onClick={() => handleSave(pl)}>Save</button>

              </div>
            </div>
          
          )
        ))}
      </div>

      <hr style={{ margin: '24px 0' }} />
    </div>
  );
}


export default MoodInput;
