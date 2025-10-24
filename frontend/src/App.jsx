import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import React, { useState, useEffect, useContext } from "react";
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Results from './pages/Results.jsx';
import Playlists from './pages/Playlists.jsx';
import PersonalityQuiz from './pages/PersonalityQuiz.jsx';
import Chart from './pages/Chart.jsx';
import Profile from './pages/Profile.jsx';

import './index.css';

import { AppProvider, AppContext } from "./context/AppContext";

function AppWrapper() {
  const location = useLocation();
  const { accessToken } = useContext(AppContext);
  const showNavbar = location.pathname !== "/";

  return (
    <div className="app-container">
      {showNavbar && <Navbar />}
      <div className="mood-wrapper">
        <Routes>
          <Route
            path="/"
            element={
              !accessToken ? <Login /> : <Navigate to="/home" replace />
            }
          />
          <Route
            path="/home"
            element={
              accessToken ? <Home /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/results"
            element={
              accessToken ? <Results /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/personality-quiz"
            element={
              accessToken ? <PersonalityQuiz /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/playlists"
            element={
              accessToken ? <Playlists /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/chart"
            element={
              accessToken ? <Chart /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/profile"
            element={
              accessToken ? <Profile /> : <Navigate to="/" replace />
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppWrapper />
      </AppProvider>
    </Router>
  );
}

export default App;
