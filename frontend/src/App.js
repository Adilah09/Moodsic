import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import MyPlaylists from './pages/MyPlaylists.jsx';
import PersonalityQuiz from './pages/PersonalityQuiz.jsx';
import Chart from './pages/Chart.jsx';
import Profile from './pages/Profile.jsx';

import './index.css';

// wrapper component to handle conditional navbar
function AppWrapper() {
  const location = useLocation();
  const showNavbar = location.pathname !== "/"; // hide navbar on login

  return (
    <>
      <div className="app-container">
        {showNavbar && <Navbar />}
        <div className="mood-wrapper">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/personality-quiz" element={<PersonalityQuiz />} />
            <Route path="/my-playlists" element={<MyPlaylists />} />
            <Route path="/chart" element={<Chart />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
