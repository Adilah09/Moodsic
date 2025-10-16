document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    if (!name || !username || !password || !confirmPassword) {
      alert("Please fill in all fields!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Load or create default user data
    let users = JSON.parse(localStorage.getItem("users")) || [
      { name: "John Doe", username: "john123", password: "abc123" },
      { name: "Jane Smith", username: "jane_smith", password: "pass456" },
      { name: "Alex Tan", username: "alex_tan", password: "mypassword" }
    ];

    // Check for duplicate username
    if (users.some(user => user.username === username)) {
      alert("Username already exists! Please choose another.");
      return;
    }

    // Add new user
    users.push({ name, username, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Account created successfully! You can now log in.");
    window.location.href = "sign-in.html";
  });
});
