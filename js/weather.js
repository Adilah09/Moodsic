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

const temp_images = {
    "Hot": "img/weather/hot.jpg",   // Celsius > 25
    "Okay": "img/weather/okay.jpg", // Celsius 5-25
    "Cold": "img/weather/cold.jpg"  // Celsius < 5
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

                // Modify API endpoint to use lat & lon
                let api_endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weather_api_key}&units=metric`;

                // Fetch weather data using lat & lon
                axios.get(api_endpoint)
                .then(response => {
                    console.log(response.data);

                    // 1) Retrieve weather info "Rain"
                    let weather_images = [];
                    let weather_info_array = response.data.weather;
                    console.log(weather_info_array);
                    for (weather_object of weather_info_array) {
                        let weather_info = weather_object.main;

                        let weather_image = weather_type_images[weather_info];
                        weather_images.push(weather_image);
                    }
                    console.log(weather_images);

                    // 3) JavaScript DOM - Weather
                    let weather_images_div = document.getElementById('weather_images');
                    weather_images_div.innerHTML = '';
                    for (image of weather_images) {
                        let para = document.createElement('p');
                        let img = document.createElement('img');
                        img.setAttribute("src", image);
                        para.appendChild(img);
                        weather_images_div.appendChild(para);
                    }
                    
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