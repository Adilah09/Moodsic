import { useNavigate } from "react-router-dom";
import './Login.css';

function Login({ onLogin }) {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await onLogin(); // trigger Spotify OAuth
    navigate("/home"); // go to Home page after login
  };

  return (
    <div className="landing-wrapper">
      <h1>Find your vibe. Every day. 🎶</h1>
      <p>Generate playlists based on your mood, personality, and even the weather.</p>

      <button className="spotify-login-btn" onClick={handleLogin}>
        Login with Spotify
      </button>

      <button className="skip">
        <a href="/home">Skip for now</a>
      </button>
    </div>
  );
}

export default Login;