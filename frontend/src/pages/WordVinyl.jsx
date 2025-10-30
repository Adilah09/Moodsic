import React, { useEffect, useRef } from "react";
import "./WordVinyl.css";

// Word data from wordvinylwords.js
const allWords = [
  "happy", "cool", "love", "smile", "tree", 
  "river", "forest", "flower", "mountain", "coral", "ocean", "shell", 
  "wind", "rain", "storm", "thunder", "lightning", "ember", "spark", "flame", "smoke", "ash"
];

const ringSpecs = [
  { name: "inner", radius: 50, count: 5, maxLength: 6, breakpoint: "d-none d-sm-block" },
  { name: "middle", radius: 100, count: 7, maxLength: 10, breakpoint: "d-none d-sm-none d-md-block" },
  { name: "outer", radius: 150, count: 10, maxLength: 10, breakpoint: "d-none d-sm-none d-md-none d-lg-block" }
];

function WordVinyl({ handleSelectedWords }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Create the rings and words dynamically
    ringSpecs.forEach(ring => {
      const ringDiv = document.createElement("div");
      ringDiv.classList = "ring " + ring.name + " " + ring.breakpoint;

      // Filter words for this ring based on maxLength
      const ringWords = allWords.filter(w => w.length <= ring.maxLength).slice(0, ring.count);

      const totalAngle = 2 * Math.PI;
      const wordGapAngle = 0.08; // gap between words
      const usableAngle = totalAngle - ring.count * wordGapAngle;
      const angleStep = usableAngle / ring.count;

      ringWords.forEach((word, i) => {
        const span = document.createElement("span");
        span.classList.add("word");
        span.textContent = word;

        // Measure word width dynamically
        document.body.appendChild(span);
        const wordWidth = span.offsetWidth;
        document.body.removeChild(span);

        // Center the word along the curve
        const angle = i * (angleStep + wordGapAngle) + angleStep / 2;

        const x = Math.cos(angle) * ring.radius;
        const y = Math.sin(angle) * ring.radius;
        const rotation = angle * 180 / Math.PI + 90;

        span.style.left = `calc(50% + ${x}px)`;
        span.style.top = `calc(50% + ${y}px)`;
        span.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

        // Add click event to select the word
        span.addEventListener("click", () => {
          handleSelectedWords(word); // Pass selected word to the parent
        });

        ringDiv.appendChild(span);
      });

      containerRef.current.appendChild(ringDiv);
    });
  }, [handleSelectedWords]); // Re-run effect when handleSelectedWords changes

  return (
    <div>
      <div className="ring-container" ref={containerRef}>
        <div className="center-label"></div>
      </div>
    </div>
  );
}

export default WordVinyl;
