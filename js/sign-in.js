document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("Please enter both username and password!");
      return;
    }

    // Get existing users
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if credentials match
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      alert(`👋 Welcome back, ${user.name}!`);
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      window.location.href = "index.html"; // redirect after login
      console.log("yes im logged in")
    } else {
      alert("Invalid username or password!");
    }
  });
});