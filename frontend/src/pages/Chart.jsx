import React, { useState } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function ChartPage() {
  const [userStats, setUserStats] = useState({
    mood: 72,
    energy: 84,
    creativity: 65,
    calmness: 58,
    focus: 91,
  });

  const labels = Object.keys(userStats).map(
    (key) => key.charAt(0).toUpperCase() + key.slice(1)
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Your Mood Profile",
        data: Object.values(userStats),
        backgroundColor: "rgba(255, 105, 180, 0.25)",
        borderColor: "#ff6fa8",
        borderWidth: 2,
        pointBackgroundColor: "#ffb6d5",
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: { color: "#333" },
        grid: { color: "#666" },
        pointLabels: { color: "#ffb6d5", font: { size: 14 } },
        ticks: { color: "#aaa", backdropColor: "transparent" },
        min: 0,
        max: 100,
      },
    },
    plugins: {
      legend: {
        labels: { color: "#ffb6d5" },
      },
    },
    animation: {
      duration: 800,
      easing: "easeOutElastic",
    },
  };

  return (
    <div className="mood-wrapper">
      <div className="mood-card">
        <h1>Your Personality Result!</h1>
      </div>

      <div className="mood-card">
        <h1>Your Mood History</h1>
      </div>

      <div className="mood-card">
        <h1>Your Track Genre!</h1>
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <div style={{ width: "500px", margin: "0 auto" }}>
            <Radar data={data} options={options} />
          </div>
        </div>
      </div>

      <div className="mood-card">
        <h1>Top Songs</h1>
      </div>

    </div>
  


  );
}

export default ChartPage;
