import { useState } from 'react';
import './Home.css';

export default function Home() {
  const [mood, setMood] = useState('');

  const handleSubmit = () => {
    alert(`Your vibe: ${mood}`); // placeholder, later navigate to result page
  };

  return (
    <div className="mood-card">
      <h1>What's your vibe today?</h1>
      <div className="subtitle">Enter a mood to generate your playlist</div>

      <input
        type="text"
        id="mood-input"
        placeholder="ex: chill, happy"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
      />

      <button
        id="submit-btn"
        onClick={handleSubmit}
        disabled={!mood.trim()}
      >
        Generate My Vibe 🎶
      </button>
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
    </div>
  );
}

