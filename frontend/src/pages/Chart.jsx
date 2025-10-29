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

// Register the necessary Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function ChartPage() {
  const chartRef = useRef();

  // Mood Bubble Chart Data (dynamic)
  const data = [
    { id: "mood.Happiness", value: 40 },
    { id: "mood.Calm", value: 30 },
    { id: "mood.Energy", value: 50 },
    { id: "mood.Joy", value: 20 },
    { id: "mood.Sadness", value: 15 },
  ];

  useEffect(() => {
    const width = 928;
    const height = width;
    const margin = 1;
    const format = d3.format(",d");
    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const pack = d3.pack()
        .size([width - margin * 2, height - margin * 2])
        .padding(3);

    const root = pack(d3.hierarchy({children: data}).sum(d => d.value));

    const svg = d3.select(chartRef.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-margin, -margin, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
        .attr("text-anchor", "middle");

    const node = svg.append("g")
        .selectAll()
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("title")
        .text(d => `${d.data.id}\n${format(d.value)}`);

    node.append("circle")
        .attr("fill-opacity", 0.7)
        .attr("fill", d => color(d.data.id.split(".")[1]))
        .attr("r", d => d.r)
        .on("mouseover", (event, d) => {
          d3.select(event.target).transition().duration(300).attr("fill-opacity", 1).attr("r", d.r * 1.2);
        })
        .on("mouseout", (event, d) => {
          d3.select(event.target).transition().duration(300).attr("fill-opacity", 0.7).attr("r", d.r);
        });

    const text = node.append("text")
        .attr("clip-path", d => `circle(${d.r})`);

    text.selectAll()
        .data(d => d.data.id.split(".").pop().split(/(?=[A-Z][a-z])|\s+/g))
        .join("tspan")
        .attr("x", 0)
        .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.35}em`)
        .text(d => d);

    text.append("tspan")
        .attr("x", 0)
        .attr("y", d => `${d.length / 2 + 0.35}em`)
        .attr("fill-opacity", 0.7)
        .text(d => format(d.value));

  }, [data]);

  // Radar Chart Data (dynamic music preferences)
  const [userStats, setUserStats] = useState({
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
    <div className="chart-mood-wrapper">
      <div className="chart-mood-card">
        <h1>Your Personality Result!</h1>
        <div className="chart-explanation">
          <h3>What Does This Mean?</h3>
          <p>This chart shows your mood distribution based on your responses. Higher values indicate stronger moods in those categories, and we use these to personalize your experience.</p>
        </div>
      </div>

      <div className="chart-mood-card">
        <h1>Your Mood Bubble Chart!</h1>
        <div style={{ width: "500px", margin: "0 auto" }}>
          <svg ref={chartRef}></svg>
        </div>
        <div className="chart-explanation">
          <h3>What Does This Chart Represent?</h3>
          <p>The bubble chart represents your mood, with each bubble indicating a specific emotion like happiness, calmness, or energy. The size and color of the bubbles help visualize the intensity and type of mood you’re feeling.</p>
        </div>
      </div>

      <div className="chart-mood-card">
        <h1>Your Music Genre Preferences</h1>
        <div style={{ width: "500px", margin: "0 auto" }}>
          <Radar data={radarData} options={radarOptions} />
        </div>
        <div className="chart-explanation">
          <h3>What Does This Mean?</h3>
          <p>This radar chart shows your preferences across different music genres. Each axis represents a different genre, and the size of the area covered shows how much you enjoy that genre.</p>
        </div>
      </div>

      <div className="chart-mood-card">
        <h1>Your Top 10!</h1>
        <div className="chart-explanation">
          <h3>What Does This Mean?</h3>
          <p>This chart shows your mood distribution based on your responses. Higher values indicate stronger moods in those categories, and we use these to personalize your experience.</p>
        </div>
      </div>
    </div>
  );
}

export default ChartPage;
