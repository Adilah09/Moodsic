import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("access_token"));
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("spotify_profile");
    return saved ? JSON.parse(saved) : null;
  });

  // sync accessToken to localStorage
  useEffect(() => {
    if (accessToken) localStorage.setItem("access_token", accessToken);
    else localStorage.removeItem("access_token");
  }, [accessToken]);

  // sync profile to localStorage
  useEffect(() => {
    if (profile) localStorage.setItem("spotify_profile", JSON.stringify(profile));
  }, [profile]);

  return (
    <AppContext.Provider value={{ accessToken, setAccessToken, profile, setProfile }}>
      {children}
    </AppContext.Provider>
  );
};
