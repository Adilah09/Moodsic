import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.svg";
import ProfilePic from "../assets/profile.jpg";
import "./Navbar.css";

function Navbar() {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
    <nav className={`navbar ${show ? "navbar--visible" : "navbar--hidden"} ${window.scrollY > 20 ? "scrolled" : "" } `} >
      <div className="navbar-left">
        <Link to="/home"><img src={Logo} alt="Logo" className="logo-img" /></Link>
      </div>

      <div className="navbar-links">
        <Link to="/home">Home</Link>
        <Link to="/personality-quiz">Personality Quiz</Link>
        <Link to="/my-playlists">My Playlists</Link>
        <Link to="/chart">Chart</Link>
      </div>

      <div className="navbar-profile">
        <Link to="/profile"><span>Bae</span></Link>
        <img src={ProfilePic} alt="Profile" className="profile-img" />
      </div>
    </nav>
  );
}

export default Navbar;
