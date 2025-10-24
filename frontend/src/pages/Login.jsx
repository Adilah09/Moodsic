import React, { useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import "./Login.css";

const Login = () => {
  const { setAccessToken } = useContext(AppContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      setAccessToken(accessToken);

      // Clean URL and go to home
      window.history.replaceState({}, document.title, "/home");
      window.location.href = "/home";
    }
  }, [setAccessToken]);

  return (
    <div className="login-page">
      <h1>Welcome to Moodsic 🎵</h1>
      <p>Login with Spotify to start generating your vibes.</p>
      <button onClick={() => (window.location.href = "http://localhost:8888/login")}>
        Login with Spotify
      </button>
    </div>
  );
};

export default Login;
