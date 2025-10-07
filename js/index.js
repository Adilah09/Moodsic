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
