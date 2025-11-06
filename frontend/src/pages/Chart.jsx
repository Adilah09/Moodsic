import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Chart.css";

export default function Chart() {
  const [bubbleData, setBubbleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [personality, setPersonality] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      setError("No user email found.");
      setLoading(false);
      return;
    }

    // Fetch both mood data & personality
    async function fetchChartData() {
      try {
        // Fetch mood word frequencies
        const moodRes = await axios.post(
          "https://moodsic-backend.vercel.app/get-mood-data",
          { email }
        );

        // Fetch personality type
        const sessionRes = await axios.post(
          "https://moodsic-backend.vercel.app/get-session",
          { email }
        );

        if (sessionRes.data.success && sessionRes.data.data?.personality_type) {
          setPersonality(sessionRes.data.data.personality_type);
        }

        if (moodRes.data.success && Array.isArray(moodRes.data.data)) {
          setBubbleData(moodRes.data.data);
        } else {
          setBubbleData([]);
        }
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError("Failed to load mood data.");
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, []);

  if (loading) return <div className="chart-loading">Loading your chart...</div>;
  if (error) return <div className="chart-error">{error}</div>;

  return (
    <div className="chart-container">
      <h1>Your Mood Bubble Chart!</h1>
      {bubbleData.length === 0 ? (
        <p>No mood chosen yet 😔</p>
      ) : (
        <div className="bubbles">
          {bubbleData.map((item, i) => (
            <div
              key={i}
              className="bubble"
              style={{
                width: `${60 + item.count * 15}px`,
                height: `${60 + item.count * 15}px`,
              }}
            >
              {item.word}
            </div>
          ))}
        </div>
      )}

      <div className="chart-explanation">
        <h2>What Does This Show?</h2>
        <p>
          Each bubble represents one of your moods, such as happiness, calm or
          energy. The larger the bubble, the more frequently that mood has been
          chosen.
        </p>
      </div>

      <div className="chart-mood-card">
        <h2>Your Personality Type 🌸</h2>
        {personality ? (
          <h3>{personality}</h3>
        ) : (
          <p>No personality result yet. Take the quiz to discover yours!</p>
        )}
      </div>
    </div>
  );
}
