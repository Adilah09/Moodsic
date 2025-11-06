import React, { useEffect, useRef, useState } from "react";
import "./WordVinyl.css";
import Logo from "../assets/logo.svg";

const SERVER_URL = "https://moodsic-backend.vercel.app";

// --- Helper functions ---
async function triggerWordGeneration() {
  console.log("Sending POST /generate-words...");
  try {
    const response = await fetch(`${SERVER_URL}/generate-words`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`Server error! ${response.status}`);
    const data = await response.json();
    console.log("Generated new words:", data.allWords);
    return data.allWords;
  } catch (error) {
    console.error("Error generating words:", error);
    return [];
  }
}

async function getGeneratedWords() {
  console.log("Sending GET /get-words...");
  try {
    const response = await fetch(`${SERVER_URL}/get-words`);
    if (!response.ok) throw new Error(`Server error! ${response.status}`);
    const data = await response.json();
    console.log("Received stored words:", data.allWords);
    return data.allWords;
  } catch (error) {
    console.error("Error fetching words:", error);
    return [];
  }
}

// --- Ring setup (matches your original vinyl layout) ---
const ringSpecs = [
  { name: "inner", radius: 60, count: 5, maxLength: 6, breakpoint: "d-sm-block" },
  { name: "middle", radius: 120, count: 7, maxLength: 10, breakpoint: "d-none d-sm-none d-md-block" },
  { name: "outer", radius: 180, count: 10, maxLength: 10, breakpoint: "d-none d-sm-none d-md-none d-lg-block" }
];

function WordVinyl({ handleSelectedWords }) {
  const containerRef = useRef(null);
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch words from backend on mount
  useEffect(() => {
    async function loadWords() {
      setLoading(true);
      let words = await getGeneratedWords();
      if (!words.length) {
        console.log("No words on server — generating new ones...");
        words = await triggerWordGeneration();
      }
      setAllWords(words);
      setLoading(false);
    }
    loadWords();
  }, []);

  // Create the circular layout once words are ready
  useEffect(() => {
    if (!allWords.length || loading) return;
    if (!containerRef.current) {
      console.warn("containerRef not ready — skipping layout render");
      return;
    }

    const container = containerRef.current;
    container.querySelectorAll(".ring").forEach(ring => ring.remove());

    ringSpecs.forEach((ring, ringIndex) => {
      const ringDiv = document.createElement("div");
      ringDiv.classList = "ring " + ring.name + " " + ring.breakpoint;

      let startIndex = 0;
      if (ringIndex === 1) startIndex = 5;
      if (ringIndex === 2) startIndex = 12;
      const ringWords = allWords.slice(startIndex, startIndex + ring.count);

      const totalAngle = 2 * Math.PI;
      const wordGapAngle = 0.08;
      const usableAngle = totalAngle - ring.count * wordGapAngle;
      const angleStep = usableAngle / ring.count;

      ringWords.forEach((word, i) => {
        const span = document.createElement("span");
        span.classList.add("word");
        span.textContent = word;

        const angle = i * (angleStep + wordGapAngle) + angleStep / 2;
        const x = Math.cos(angle) * ring.radius;
        const y = Math.sin(angle) * ring.radius;
        const rotation = (angle * 180) / Math.PI + 90;

        span.style.left = `calc(50% + ${x}px)`;
        span.style.top = `calc(50% + ${y}px)`;
        span.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

        span.addEventListener("click", () => handleSelectedWords(word));
        ringDiv.appendChild(span);
      });

      container.appendChild(ringDiv);
    });
  }, [allWords, loading, handleSelectedWords]);

  const handleRefresh = async () => {
    setLoading(true);
    const newWords = await triggerWordGeneration();
    if (newWords.length) setAllWords(newWords);
    setLoading(false);
  };

  // ✅ Your version of the return block
  return (
    <div className="ring-container-wrapper">
      {loading ? (
        <>
          <p>Generating your word vinyl...</p>
          <div className="vinyl fast">
            <div className="ring-container" ref={containerRef}></div>
            <div className="center-label">
              <img src={Logo} alt="Logo" className="logo-img" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="vinyl">
            <div className="ring-container" ref={containerRef}></div>
            <div className="center-label">
              <img src={Logo} alt="Logo" className="logo-img" />
            </div>
          </div>
          <div className="refresh" onClick={handleRefresh}>
            Refresh my words
          </div>
        </>
      )}
    </div>
  );
}

export default WordVinyl;
