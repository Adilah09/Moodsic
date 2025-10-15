// dynamic greeting based on time
function getTimeGreeting() {
  const hour = new Date().getHours();
  if(hour < 12) return ["Good morning", "🌤️"];
  else if(hour < 18) return ["Good afternoon", "☀️"];
  else return ["Good evening", "🌙"];
}

// login greeting
function updateLoginGreeting() {
  const [message, emoji] = getTimeGreeting();
  document.getElementById("greeting").textContent = `${message},`;
}
updateLoginGreeting();

// LOGIN -> HOMEPAGE
const loginBtn = document.getElementById("loginBtn");
const loginContainer = document.getElementById("loginContainer");
const homepageContainer = document.getElementById("homepageContainer");
const usernameInput = document.getElementById("username");
const profileName = document.getElementById("profileName");
const userGreeting = document.getElementById("userGreeting");

loginBtn.addEventListener("click", function(e){
  e.preventDefault();
  const username = usernameInput.value || "user";
  const [message, emoji] = getTimeGreeting();
  profileName.textContent = username;
  userGreeting.textContent = `${message}, ${username}! ${emoji}`;
  loginContainer.style.display = "none";
  homepageContainer.style.display = "block";
});

// MOOD INPUT -> update emoji dynamically
const moodInput = document.getElementById("moodInput");
const moodMap = {
  happy: "😄🎶",
  sad: "😢🎵",
  chill: "😎🎧",
  tired: "😴🎶",
  excited: "🤩🎸"
};
moodInput.addEventListener("input", () => {
  const mood = moodInput.value.toLowerCase();
  const username = usernameInput.value || "user";
  const [message, defaultEmoji] = getTimeGreeting();
  const moodEmoji = moodMap[mood] || defaultEmoji;
  userGreeting.textContent = `${message}, ${username}! ${moodEmoji}`;
});
