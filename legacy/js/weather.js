const weather_type_images = {
    "Clear": "img/weather/clear.jpg",
    "Clouds": "img/weather/clouds.jpg",
    "Haze": "img/weather/haze.jpg",
    "Mist": "img/weather/mist.jpg",
    "Rain": "img/weather/rain.jpg",
    "Smoke": "img/weather/smoke.jpg",
    "Snow": "img/weather/snow.jpg",
    "Thunderstorm": "img/weather/thunderstorm.jpg"
};

function check_weather() {
    console.log("=== [START] check_weather() ===");
    const weather_api_key = 'bbc23dde07349494203ae99ffadebca4';

    // Remove city input as we will use geolocation
    // let city = document.getElementsByTagName("input")[0].value;
    // console.log(city);

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

                let api_endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weather_api_key}&units=metric`;

                // Fetch weather data using lat & lon
                axios.get(api_endpoint)
                .then(response => {
                    console.log(response.data);

                    let weather_info_array = response.data.weather;
                    console.log(weather_info_array);

                    let weather_description = '';
                    let weather_image = '';

                    for (let weather_object of weather_info_array) {
                        let weather_info = weather_object.main;
                        weather_description = weather_info;
                        weather_image = weather_type_images[weather_description];
                    }

                    console.log(weather_description, weather_image);

                    let weather_text = document.getElementById('weather_text');
                    let weather_image_div = document.getElementById('weather_images');
                    let temp = document.getElementById('temp');

                    weather_text.innerHTML = `<h2>The weather right now is...</h2><h3>${weather_description}</h3>`;
                    // weather_text.innerHTML = `<h2>The weather right now is...</h2>`;
                    weather_image_div.innerHTML = `<img src="${weather_image}" alt="${weather_description}" class="weather-icon">`;
                    temp.style.display = 'none'

                })
                .catch(error => {
                    console.log(error.message);
                });
            },
            (error) => {
                console.error("Error getting location:", error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        console.log("Geolocation is not supported by this browser.");
    }

    console.log("=== [END] check_weather() ===");

}