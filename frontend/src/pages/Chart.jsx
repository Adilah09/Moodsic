import React, { useState, useEffect, useRef, useContext } from "react";
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
import * as d3 from "d3";
import "./Chart.css";
import { AppContext } from "../context/AppContext";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function ChartPage() {
  const chartRef = useRef();
  const barChartRef = useRef();

  // -------------------- Bubble Chart --------------------
  const [bubbleData, setBubbleData] = useState([]);
  const { accessToken } = useContext(AppContext);
  const [radarLabels, setRadarLabels] = useState([]);
  const [radarValues, setRadarValues] = useState([]);

  useEffect(() => {
    const fetchLatestSessionBits = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) return;

        // Latest selected words (limit 10)
        const wordsResp = await fetch("https://moodsic-backend.vercel.app/get-latest-words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const wordsJson = await wordsResp.json();
        if (wordsJson.success && Array.isArray(wordsJson.data)) {
          const words = wordsJson.data; // already last 10 from backend
          const sized = words.map((w) => ({ id: w, value: 20 }));
          setBubbleData(sized);
        } else {
          setBubbleData([]);
        }

        // Latest session songs for genres
        const sessionResp = await fetch("https://moodsic-backend.vercel.app/get-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const sessionJson = await sessionResp.json();
        if (sessionJson.success && sessionJson.data) {
          let songs = sessionJson.data.songs;
          if (typeof songs === "string") {
            try { songs = JSON.parse(songs); } catch { songs = []; }
          }
          if (Array.isArray(songs) && songs.length) {
            await computeGenresFromSongs(songs);
          } else {
            setRadarLabels([]);
            setRadarValues([]);
          }
        }
      } catch (e) {
        console.error("Failed to load latest session data:", e);
      }
    };

    fetchLatestSessionBits();
  }, [accessToken]);

  const computeGenresFromSongs = async (songs) => {
    try {
      if (!accessToken) return;
      const trackIds = songs
        .map((t) => t.url?.split("/").pop())
        .filter(Boolean)
        .slice(0, 50);
      if (!trackIds.length) return;

      // Get tracks -> artist IDs
      const tracksResp = await fetch(`https://api.spotify.com/v1/tracks?ids=${encodeURIComponent(trackIds.join(","))}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!tracksResp.ok) return;
      const tracksJson = await tracksResp.json();
      const artistIds = Array.from(new Set((tracksJson.tracks || [])
        .flatMap((t) => (t.artists || []).map((a) => a.id)))).slice(0, 50);
      if (!artistIds.length) return;

      // Get artists -> genres
      const artistsResp = await fetch(`https://api.spotify.com/v1/artists?ids=${encodeURIComponent(artistIds.join(","))}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!artistsResp.ok) return;
      const artistsJson = await artistsResp.json();
      const genreCount = {};
      (artistsJson.artists || []).forEach((a) => {
        (a.genres || []).forEach((g) => {
          const key = g.toLowerCase();
          genreCount[key] = (genreCount[key] || 0) + 1;
        });
      });

      const top = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
      const labels = top.map(([g]) => g);
      const values = top.map(([, c]) => c);
      setRadarLabels(labels);
      setRadarValues(values);
    } catch (e) {
      console.error("Failed to compute genres:", e);
    }
  };

  useEffect(() => {
    const width = 400;
    const height = 400;
    const margin = 1;
    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const format = d3.format(",d");

    d3.select(chartRef.current).selectAll("*").remove();

    const pack = d3.pack()
      .size([width - margin * 2, height - margin * 2])
      .padding(5);

    const root = pack(d3.hierarchy({ children: bubbleData }).sum(d => d.value));

    const svg = d3.select(chartRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    const node = svg.append("g")
      .selectAll()
      .data(root.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", (d) => d.r)
      .attr("fill", (d) => color(d.data.id))
      .attr("fill-opacity", 0.7)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr("r", d.r * 1.15)
          .attr("fill-opacity", 1);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr("r", d.r)
          .attr("fill-opacity", 0.7);
      });

    node.append("text")
      .attr("dy", "0.3em")
      .style("text-anchor", "middle")
      .style("fill", "#fff")
      .style("font-weight", "bold")
      .text(d => d.data.id);

    node.append("title")
      .text(d => `${d.data.id}: ${format(d.data.value)}`);
  }, [bubbleData]);


  const [personalityType, setPersonalityType] = useState("");

  useEffect(() => {
    const fetchPersonality = async () => {
      try {
        // Get user email from Clerk or localStorage (depends on your app)
        const email = localStorage.getItem("userEmail");
        if (!email) {
          console.warn("No email found for personality fetch");
          return;
        }

        const response = await fetch(
          `https://moodsic-backend.vercel.app/get-latest-personality?email=${encodeURIComponent(email)}`
        );
        const data = await response.json();

        if (data.success && data.personality_type) {
          setPersonalityType(data.personality_type);
        } else {
          setPersonalityType("No personality result yet 😅");
        }
      } catch (error) {
        console.error("Error fetching personality:", error);
        setPersonalityType("Error loading personality");
      }
    };

    fetchPersonality();
  }, []);

  // -------------------- Radar Chart --------------------
  const fallbackLabels = ["pop", "rock", "jazz", "hip hop", "electronic", "classical"];
  const fallbackValues = [0, 0, 0, 0, 0, 0];
  const radarData = {
    labels: radarLabels.length ? radarLabels : fallbackLabels,
    datasets: [
      {
        label: "Your Music Genre Preferences",
        data: radarValues.length ? radarValues : fallbackValues,
        backgroundColor: "rgba(255, 105, 180, 0.25)",
        borderColor: "#ff6fa8",
        borderWidth: 2,
        pointBackgroundColor: "#ffb6d5",
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        grid: { color: "#666" },
        angleLines: { color: "#555" },
        pointLabels: { color: "#ffb6d5", font: { size: 14 } },
        ticks: { color: "#aaa", backdropColor: "transparent", showLabelBackdrop: false },
        min: 0,
        max: Math.max(5, ...(radarValues.length ? radarValues : [1])) + 1,
      },
    },
    plugins: {
      legend: { labels: { color: "#ffb6d5" } },
    },
    elements: {
      line: { borderWidth: 2 },
      point: { radius: 3 },
    },
    maintainAspectRatio: false,
  };

  // -------------------- Render Layout --------------------
  return (
    <div className="chart-mood-wrapper">
      <div className="chart-mood-card">
        <h1>Your Personalized Dashboard</h1>
        <p>
          This dashboard presents a personalized view of your moods and preferences,
          providing insights into how your emotions, music tastes, and weekly mood
          fluctuations shape your unique personality.
        </p>
      </div>

      <div className="chart-mood-card">
        <h1>Your Mood Bubble Chart!</h1>
        {bubbleData.length > 0 ? (
          <svg ref={chartRef}></svg>
        ) : (
          <p className="no-data-text">No mood selected</p>
        )}
        <div className="chart-explanation">
          <h3>What Does This Show?</h3>
          <p>
            Each bubble represents one of your latest 10 moods that you have selected in Moodsic.
            The chart gives a quick, visual overview of the moods you have been exploring or feeling recently,
            letting you see all your emotional choices together in one vibrant display.
          </p>
        </div>
      </div>


      <div className="chart-mood-card">
        <h1>Your Music Genre Preferences</h1>
        <div className="radar-wrapper">
          <Radar data={radarData} options={radarOptions} />
        </div>
        <div className="chart-explanation">
          <h3>What Does This Mean?</h3>
          <p>
            This radar chart is your personal sonic mood map — showing the genres that define your latest playlist vibe. 
            Each line represents a different genre and the wider the shape spreads, the stronger your current pull toward those sounds. 
            Here is a quick glimpse into the rhythm of what you have been feeling lately.
          </p>
        </div>
      </div>

      <div className="chart-mood-card">
        <h1>Your Personality Result!</h1>
        <h2 style={{ color: "#ff6fa8", marginTop: "10px" }}>
          {personalityType || "Loading..."}
        </h2>
        {/* Personality image based on hardcoded mapping */}
        {(() => {
          const t = (personalityType || "").toLowerCase();
          // Map 4 personalities to static images in public/assets/game
          let img = "";
          if (t.includes("choc") || t.includes("cookie")) img = "/assets/game/choctart.jpeg";
          else if (t.includes("vanilla")) img = "/assets/game/vanillabean.jpg";
          else if (t.includes("lemon")) img = "/assets/game/lemon.jpeg";
          else if (t.includes("pepper") || t.includes("ghost")) img = "/assets/game/ghostpepper.jpg";
          return img ? (
            <img
              src={img}
              alt={personalityType}
              className="personality-image"
            />
          ) : null;
        })()}
        <div className="chart-explanation">
          <h3>What Does This Mean?</h3>
          <p>
            This section provides insight into your overall personality trends based on
            your quiz results. It reflects how your emotions and preferences shape your unique vibe.
          </p>
        </div>
      </div>
    </div>
  );
}
 