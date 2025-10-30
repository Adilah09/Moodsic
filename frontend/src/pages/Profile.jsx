import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import "./Profile.css";
import Logo from "../assets/logo.svg";

function Profile() {
  const { accessToken, setAccessToken, profile, setProfile } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    setAccessToken(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setProfile(null);
  };

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        if (!profile) {
          const res = await axios.get("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setProfile(res.data);
        }
      } catch (err) {
        console.error("Spotify profile fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken, profile]);

  return (
    <div className="profile-page">
      {loading ? (
        <p>Loading profile...</p>
      ) : !profile ? (
        <p>Could not fetch profile.</p>
      ) : (
        <>
          <img src={profile.images?.[0]?.url || {Logo}} alt="Profile" />
          <h1 className="username">{profile.display_name}</h1>
        </>
      )}
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
}

export default Profile;
