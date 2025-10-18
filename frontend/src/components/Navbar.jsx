import { Link } from 'react-router-dom';
import './Navbar.css';
import Logo from '../assets/logo.svg';
import ProfilePic from '../assets/profile.jpg'; // your image

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/"><img src={Logo} alt="Moodsic Logo" className="logo-img" /></Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/my-moods">My Moods</Link>
        <Link to="/personality-quiz">Personality Quiz</Link>
        <Link to="/chart">Chart</Link>
      </div>

      <div className="navbar-profile">
        <Link to="/profile">Bae</Link>
        <img src={ProfilePic} alt="Profile" className="profile-img" />
      </div>
    </nav>
  );
}
