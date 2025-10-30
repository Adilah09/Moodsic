import React from "react";

export default function QuestionPage({
  title,
  image,
  storyText,
  questionText,
  options,
  selected,
  onSelect,
  onNext,
  showNext = false,
}) {
  return (
    <div className="page active">
      <h2>{title}</h2>
      <div className="image-container">
        <img src={image} alt={title} className="story-image" />
      </div>
      <div className="story-text">
        <p>{storyText}</p>
      </div>

      <h3>{questionText}</h3>
      <div className="options">
        {options.map((opt) => (
          <div
            key={opt.value}
            className={`option ${selected === opt.value ? "selected" : ""}`}
            onClick={() => onSelect(opt.value)}
          >
            <img src={opt.image} alt={opt.title} className="option-image" />
            <div className="option-content">
              <span className="option-letter">{opt.value}</span>
              <strong>{opt.title}.</strong> {opt.description}
            </div>
          </div>
        ))}
      </div>

      {showNext && (
        <button className="btn" onClick={onNext} disabled={!selected}>
          Continue
        </button>
      )}
    </div>
  );
}
