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
import "./Chart.css";

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
  const bubbleData = [
    { id: "Happiness", value: 40 },
    { id: "Calm", value: 30 },
    { id: "Energy", value: 50 },
    { id: "Joy", value: 20 },
    { id: "Sadness", value: 15 },
  ];

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


  // -------------------- Diverging Bar Chart --------------------
  useEffect(() => {
    const emotionData = [
      { emotion: "Mon", value: 60 },
      { emotion: "Tues", value: 40 },
      { emotion: "Wed", value: 30 },
      { emotion: "Thurs", value: -20 },
      { emotion: "Fri", value: -50 },
      { emotion: "Sat", value: -35 },
      { emotion: "Sun", value: -35 },
    ];

    const width = 400;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };

    d3.select(barChartRef.current).selectAll("*").remove();

    const svg = d3.select(barChartRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 12px sans-serif;");

    const x = d3.scaleBand()
      .domain(emotionData.map(d => d.emotion))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([-100, 100])
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleDiverging()
      .domain([-100, 0, 100])
      .interpolator(d3.interpolateRdYlBu);

    svg.append("g")
      .selectAll("rect")
      .data(emotionData)
      .join("rect")
      .attr("x", d => x(d.emotion))
      .attr("y", d => y(Math.max(0, d.value)))
      .attr("height", d => Math.abs(y(d.value) - y(0)))
      .attr("width", x.bandwidth())
      .attr("fill", d => color(d.value))
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("opacity", 0.85);

    svg.append("g")
      .attr("transform", `translate(0,${y(0)})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("dy", "1.5em")
      .attr("font-size", "12px");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d > 0 ? `+${d}` : d))
      .call(g => g.select(".domain").remove());

    svg.append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "#ffb6d5")
      .attr("stroke-width", 2)
      .attr("opacity", 0.6);

    svg.append("text")
      .attr("x", width - margin.right + 5)
      .attr("y", margin.top)
      .attr("text-anchor", "start")
      .attr("font-size", "20px")
      .text("😊");

    svg.append("text")
      .attr("x", width - margin.right + 5)
      .attr("y", height - margin.bottom)
      .attr("text-anchor", "start")
      .attr("font-size", "20px")
      .text("😢");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "#ffb6d5")
      .text("Emotional Balance Chart");

  }, []);

  // -------------------- Radar Chart --------------------
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
        <h1>Your Personality Result!</h1>
        <h2 style={{ color: "#ff6fa8", marginTop: "10px" }}>
          {personalityType || "Loading..."}
        </h2>
        <div className="chart-explanation">
          <h3>What Does This Mean?</h3>
          <p>
            This section provides insight into your overall personality trends based on
            your quiz results. It reflects how your emotions and preferences shape your unique vibe.
          </p>
        </div>
      </div>

      <div className="chart-mood-card">
        <h1>Your Emotional Balance</h1>
        <svg ref={barChartRef}></svg>
        <div className="chart-explanation">
          <h3>What Does This Show?</h3>
          <p>
            This diverging bar chart visualizes the balance between your positive and negative emotions.
            Bars going upward represent positive emotions like happiness and calmness,
            while downward bars reflect negative emotions such as sadness or tiredness.
          </p>
        </div>
      </div>

      <div className="chart-mood-card">
        <h1>Your Mood Bubble Chart!</h1>
        <svg ref={chartRef}></svg>
        <div className="chart-explanation">
          <h3>What Does This Show?</h3>
          <p>
            Each bubble represents one of your moods, such as happiness, calm, or energy.
            The larger the bubble, the stronger that mood has been recently. Hover over a bubble to see its details.
          </p>
        </div>
      </div>

      <div className="chart-mood-card">
        <h1>Your Music Genre Preferences</h1>
        <Radar data={radarData} options={radarOptions} />
        <div className="chart-explanation">
          <h3>What Does This Mean?</h3>
          <p>
            This radar chart compares how much you enjoy different genres.
            Each axis represents a genre, and a wider area shows higher preference.
          </p>
        </div>
      </div>
    </div>
  );
}
