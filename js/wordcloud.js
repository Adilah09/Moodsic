const wordCloudContainer = document.getElementById("wordCloud");
const submitBtn = document.getElementById("submitBtn");
const selectedWordsDiv = document.getElementById("selectedWords");

// Randomly select up to 10 words
function getRandomWords(wordList, count = 10) {
  const shuffled = [...wordList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Display 10 words in 2 rows of 5
function createWordDisplay() {
  const displayWords = getRandomWords(words, 10);
  displayWords.forEach(word => {
    const span = document.createElement("span");
    span.textContent = word;
    span.classList.add("word");
    span.addEventListener("click", () => span.classList.toggle("selected"));
    wordCloudContainer.appendChild(span);
  });
}

createWordDisplay();

// Handle submit
submitBtn.addEventListener("click", () => {
  const selected = [...document.querySelectorAll(".word.selected")].map(
    el => el.textContent
  );

  // Hide the word cloud and button
  document.getElementById("wordCloudContainer").style.display = "none";
  submitBtn.style.display = "none";

  // Show selected words
  selectedWordsDiv.style.display = "block";
  selectedWordsDiv.innerHTML =
    selected.length > 0
      ? selected.map(word => `<span>${word}</span>`).join("")
      : "<p>No words selected.</p>";
});
