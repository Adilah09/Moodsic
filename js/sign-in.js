document.addEventListener("DOMContentLoaded", () => {
  // ✅ Initialize default users if none exist
  if (!localStorage.getItem("users")) {
    const defaultUsers = [
      { name: "John Doe", username: "john123", password: "abc123" },
      { name: "Jane Smith", username: "jane_smith", password: "pass456" },
      { name: "Alex Tan", username: "alex_tan", password: "mypassword" }
    ];
    localStorage.setItem("users", JSON.stringify(defaultUsers));
    console.log("Default users added to localStorage ✅");
  }

  const form = document.querySelector("form");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("Please enter both username and password!");
      return;
    }

    // Get users from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Check credentials
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      alert(`👋 Welcome back, ${user.name}!`);
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      window.location.href = "weather.html";
      console.log("✅ Logged in successfully");
    } else {
      alert("❌ Invalid username or password!");
    }
  });
});
