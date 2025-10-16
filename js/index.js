// for navbar
fetch("partials/navbar.html")
    .then(res => res.text())
    .then(data => {
    document.getElementById("navbar").innerHTML = data;
    });

// for footer
fetch("partials/footer.html")
    .then(res => res.text())
    .then(data => {
    document.getElementById("footer").innerHTML = data;
    });
  
document.getElementById("navbar").innerHTML = `
<nav class="navbar navbar-expand-lg navbar-dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="home.html">
      <img src="img/logo.svg" width="30" height="30" class="d-inline-block align-top" alt="">
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
      data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
      aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <div class="navbar-nav">
        <a class="nav-item nav-link active" href="home.html">Home</a>
        <a class="nav-item nav-link" href="#">Personality Quiz</a>
        <li class="nav-item dropdown">
          <a class="nav-item nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink"
             data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
             MoodMatch
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
            <li><a class="dropdown-item" href="moodmatch.html">Mood Input</a></li> <!-- ✅ Works -->
            <li><a class="dropdown-item" href="#">Word Cloud</a></li>
          </ul>
        </li>
        <a class="nav-item nav-link" href="weather.html">Weather</a>
        <a class="nav-item nav-link" href="#">My Playlists</a>
      </div>
    </div>
  </div>
</nav>
`;
