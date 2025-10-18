import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import MyMoods from './pages/MyMoods';
import PersonalityQuiz from './pages/PersonalityQuiz';
import Chart from './pages/Chart';
import Profile from './pages/Profile';

import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="mood-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-moods" element={<MyMoods />} />
            <Route path="/personality-quiz" element={<PersonalityQuiz />} />
            <Route path="/chart" element={<Chart />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
