import React, { useState, useEffect, useRef } from "react";
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
import axios from "axios";
import "./Chart.css";

// Register necessary Chart.js components
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

  // 🩷 State for mood bubbles
  const [bubbleData, setBubbleData] = useState([]);
  const [loadingMoods, setLoadingMoods] = useState(true);
  const [error, setError] = useState(null);

  // 🧠 Fetch user mood data
  useEffect(() => {
    async function fetchMoods() {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) {
          setError("No user email found");
          setLoadingMoods(false);
          return;
        }

        const res = await axios.post("https://moodsic-backend.vercel.app/get-mood-data", { email });

        if (res.data.success && res.data.data.length > 0) {
          const formatted = res.data.data.map((item) => ({
            id: item.word,
            value: item.count * 20, // scale bubble size visually
          }));
          setBubbleData(formatted);
        } else {
          setBubbleData([]);
        }
      } catch (err) {
        console.error("Error fetching mood data:", err);
        setError("Failed to load moods");
      } finally {
        setLoadingMoods(false);
      }
    }

    fetchMoods();
  }, []);

  // 🎈 Render Bubble Chart using D3
  useEffect(() => {
    if (!bubbleData.length) return;

    const width = 400;
    const height = 400;
    const margin = 1;
    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const format = d3.format(",d");

    // Clear previous render
    d3.select(chartRef.current).selectAll("*").remove();

    const pack = d3.pack()
      .size([width - margin * 2, height - margin * 2])
      .padding(5);

    const root = pack(d3.hierarchy({ children: bubbleData }).sum((d) => d.value));

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
      .attr("fill-opacity", 0.75)
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
          .attr("fill-opacity", 0.75);
      });

    node.append("text")
      .attr("dy", "0.3em")
      .style("text-anchor", "middle")
      .style("fill", "#fff")
      .style("font-weight", "bold")
      .text((d) => d.data.id);

    node.append("title")
      .text((d) => `${d.data.id}: ${format(d.data.value)}`);
  }, [bubbleData]);

  // 🎵 Dummy weekly bar chart (placeholder)
  const barData = [
    { day: "Mon", value: 40 },
    { day: "Tue", value: 60 },
    { day: "Wed", value: 30 },
    { day: "Thu", value: 70 },
    { day: "Fri", value: 80 },
    { day: "Sat", value: 90 },
    { day: "Sun", value: 50 },
  ];

  useEffect(() => {
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    d3.select(barChartRef.current).selectAll("*").remove();

    const svg = d3.select(barChartRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    const x = d3.scaleBand()
      .domain(barData.map((d) => d.day))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(barData, (d) => d.value)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.append("g")
      .attr("fill", "#ff8ccf")
      .selectAll("rect")
      .data(barData)
      .join("rect")
      .attr("x", (d) => x(d.day))
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => y(0) - y(d.value))
      .attr("width", x.bandwidth());

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .attr("font-size", "12px");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .attr("font-size", "12px");
  }, [barData]);

  // 🎧 Radar chart data
  const [userStats] = useState({
    Pop: 80,
    Metal: 60,
    Rock: 70,
    Jazz: 40,
    Classical: 50,
    Rap: 90,
    Reggae: 65,
  });

  const radarLabels = Object.keys(userStats);
  const radarData = {
    labels: radarLabels,
    datasets: [
      {
        label: "Your Music Genre Preferences",
        data: Object.values(userStats),
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
        pointLabels: { color: "#ffb6d5", font: { size: 14 } },
        ticks: { color: "#aaa", backdropColor: "transparent" },
        min: 0,
        max: 100,
      },
    },
    plugins: {
      legend: { labels: { color: "#ffb6d5" } },
    },
  };

  return (
    <div className="chart-mood-wrapper">
      {/* Personalized Dashboard */}
      <div className="chart-mood-card">
        <h1>Your Personalized Dashboard</h1>
        <p>
          This dashboard presents a personalized view of your moods and preferences,
          providing insights into how your emotions, music tastes, and weekly mood fluctuations
          shape your unique personality.
        </p>
      </div>

      {/* Weekly Mood Overview */}
      <div className="chart-mood-card">
        <h1>Your Mood Over the Week</h1>
        <svg ref={barChartRef}></svg>
        <div className="chart-explanation">
          <h3>What Does This Mean?</h3>
          <p>
            This bar chart shows how your mood fluctuated throughout the week.
            Higher bars mean stronger emotions or more frequent mood changes.
          </p>
        </div>
      </div>

      {/* Mood Bubble Chart */}
      <div className="chart-mood-card">
        <h1>Your Mood Bubble Chart!</h1>

        {loadingMoods ? (
          <p style={{ color: "#ffb6d5" }}>Loading your moods...</p>
        ) : error ? (
          <p style={{ color: "#ff4f4f" }}>{error}</p>
        ) : bubbleData.length === 0 ? (
          <p style={{ color: "#ffb6d5", fontStyle: "italic" }}>No mood chosen yet 😔</p>
        ) : (
          <svg ref={chartRef}></svg>
        )}

        <div className="chart-explanation">
          <h3>What Does This Show?</h3>
          <p>
            Each bubble represents one of your moods, such as happiness, calm or energy.
            The larger the bubble, the more frequently that mood has been chosen.
          </p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="chart-mood-card">
        <h1>Your Music Genre Preferences</h1>
        <Radar data={radarData} options={radarOptions} />
        <div className="chart-explanation">
          <h3>What Does This Mean?</h3>
          <p>
            This radar chart compares how much you enjoy different genres.
            A wider area shows higher preference.
          </p>
        </div>
      </div>
    </div>
  );
}
