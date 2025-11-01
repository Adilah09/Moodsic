import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import "./Profile.css";
import ProfilePic from "../assets/profile.jpg";

function Profile() {
  const { accessToken, setAccessToken, profile, setProfile } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

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

  // fetch all sessions from backend
  useEffect(() => {
    const fetchAllSessions = async () => {
      if (!profile?.email) return;

      try {
        const res = await axios.get("http://localhost:8888/get-all-sessions", {
          params: { email: profile.email },
        });
        setSessions(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAllSessions();
  }, [profile]);

  return (
    <div className="profile-page">
      {loading ? (
        <p>Loading profile...</p>
      ) : !profile ? (
        <p>Could not fetch profile.</p>
      ) : (
        <>
          {profile.images && profile.images.length > 0 ? (
            <img
              src={profile.images[0].url}
              alt="Profile"
              className="profile-img"
            />
          ) : (
            <img
              src={ProfilePic}   // path to your logo
              alt="Logo"
              className="profile-img"
            />
          )}
          <h1 className="username">{profile.display_name}</h1>
        </>
      )}
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
}

export default Profile;
