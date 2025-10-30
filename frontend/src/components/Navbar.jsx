import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.svg";
import ProfilePic from "../assets/profile.jpg";
import "./Navbar.css";
import { AppContext } from "../context/AppContext";

function Navbar() {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { profile } = useContext(AppContext);

  const controlNavbar = () => {
    if (window.scrollY > lastScrollY) {
      setShow(false); // hide when scrolling down
    } else {
      setShow(true); // show when scrolling up
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  return (
    <nav className={`navbar ${show ? "navbar--visible" : "navbar--hidden"} ${window.scrollY > 20 ? "scrolled" : ""}`}>
      <div className="navbar-left">
        <Link to="/home"><img src={Logo} alt="Logo" className="logo-img" /></Link>
      </div>

      <div className="navbar-links">
        <Link to="/home">Home</Link>
        <Link to="/game">Personality Quiz</Link>
        <Link to="/playlists">Playlists</Link>
        <Link to="/chart">Dashboard</Link>
      </div>

      <div className="navbar-profile">
        {profile ? (
          <>
            <Link to="/profile"><span>{profile.display_name}</span>
              {profile.images && profile.images.length > 0 ? (
                <img
                  src={profile.images[0].url}
                  alt="Profile"
                  className="profile-img"
                />
              ) : (
                <img
                  src={ProfilePic} 
                  alt="pfp"
                  className="profile-img"
                />
              )}
            </Link>
          </>
        ) : (
          <>
            <Link to="/profile"><span>You</span>
              <img src={ProfilePic} alt="Profile" className="profile-img" />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}


export default Navbar;
