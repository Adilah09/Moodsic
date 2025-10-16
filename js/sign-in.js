document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // prevent page reload

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }

        try {
            // Fetch mock user data
            const response = await fetch("js/users.json");
            const data = await response.json();

            // Check for a match
            const user = data.users.find(
                u => u.username === username && u.password === password
            );

            if (user) {
                alert("Login successful!");
                // Redirect to home page or dashboard
                window.location.href = "weather.html"; 
            } else {
                alert("Invalid username or password. Please try again.");
            }

        } catch (error) {
            console.error("Error fetching user data:", error);
            alert("Something went wrong. Please try again later.");
        }
    });
});
