import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import "./SessionExpired.css";

export default function SessionExpired() {
  const { setAccessToken, setProfile, setSessionExpired } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setAccessToken(null);
    setProfile(null);
    setSessionExpired(false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("spotify_profile");
    navigate("/", { replace: true });
  };

  return (
    <div className="session-expired-container">
      <div className="session-expired-card">
        <div className="session-expired-icon">🔒</div>
        <h1 className="session-expired-title">Session Expired</h1>
        <p className="session-expired-message">
          Your session has expired. Please log in again to continue.
        </p>
        <button className="session-expired-button" onClick={handleLogout}>
          Log In Again
        </button>
      </div>
    </div>
  );
}

