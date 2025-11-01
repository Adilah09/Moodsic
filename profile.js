const form = document.getElementById('profileForm');
const display = document.getElementById('displayProfile');

const nameInput = document.getElementById('name');
const moodInput = document.getElementById('mood');
const genreInput = document.getElementById('genre');

const displayName = document.getElementById('displayName');
const displayMood = document.getElementById('displayMood');
const displayGenre = document.getElementById('displayGenre');
const playlistList = document.getElementById('playlistList');
const editBtn = document.getElementById('editBtn');

// Example: playlists (replace with dynamic Spotify API data later)
const examplePlaylists = ["Chill Vibes", "Happy Hits", "Rainy Day Jazz"];

// Load profile on page load
window.onload = () => {
  const profile = JSON.parse(localStorage.getItem('userProfile'));
  if (profile) showProfile(profile);
};

// Save profile on form submit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const profile = {
    name: nameInput.value,
    mood: moodInput.value,
    genre: genreInput.value,
    playlists: examplePlaylists
  };
  localStorage.setItem('userProfile', JSON.stringify(profile));
  showProfile(profile);
});

function showProfile(profile) {
  form.classList.add('hidden');
  display.classList.remove('hidden');

  displayName.textContent = profile.name;
  displayMood.textContent = profile.mood;
  displayGenre.textContent = profile.genre;

  // Display playlists
  playlistList.innerHTML = "";
  profile.playlists.forEach(pl => {
    const li = document.createElement('li');
    li.textContent = pl;
    playlistList.appendChild(li);
  });
}

// Edit button to show form again
editBtn.addEventListener('click', () => {
  display.classList.add('hidden');
  form.classList.remove('hidden');

  const profile = JSON.parse(localStorage.getItem('userProfile'));
  if (profile) {
    nameInput.value = profile.name;
    moodInput.value = profile.mood;
    genreInput.value = profile.genre;
  }
});
