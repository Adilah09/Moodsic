import React from "react";

export default function IntroPage({ title, image, storyText, onStart }) {
  return (
    <div className="page active">
      <h1>{title}</h1>
      <div className="image-container">
        <img src={image} alt={title} className="story-image" />
      </div>
      <div className="story-text">
        <p>{storyText}</p>
      </div>
      <button className="btn" onClick={onStart}>
        Begin Your Journey
      </button>
    </div>
  );
}
