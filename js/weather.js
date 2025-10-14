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


// DO NOT CHANGE THE FUNCTION SIGNATURE
function check_weather() {

    console.log("=== [START] check_weather() ===");
    const weather_api_key = 'bbc23dde07349494203ae99ffadebca4';

    // const city = 'Singapore'; // Default value, you need to replace this string with actual user input
    let city = document.getElementsByTagName("input")[0].value
    console.log(city)

    // DO NOT MODIFY THIS
    let api_endpoint = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weather_api_key}&units=metric`;


    axios.get(api_endpoint)
    .then(response => {
        console.log(response.data);
        
        // 1) Retrieve weather info "Rain"
        let weather_images = [];
        let weather_info_array = response.data.weather
        for(weather_object of weather_info_array) {
            let weather_info = weather_object.main;
            console.log(weather_info); // "Rain"

            let weather_image = weather_type_images[weather_info];
            console.log(weather_image);
            weather_images.push(weather_image);
        }
        console.log(weather_images);


        // 2) Retrieve temperature (Celsius)
        let temperature_info = response.data.main.temp;
        console.log(temperature_info); // 30.xx (metric)

        let temp_label = '';
        if( temperature_info > 25 ) {
            temp_label = "Hot";
            // console.log("I am Hot");
        }
        else if (temperature_info >= 5) {
            temp_label = "Okay";
            // console.log("I am Okay");
        }
        else {
            temp_label = "Cold";
            // console.log("I am Cold");
        }

        let temp_image = temp_images[temp_label];
        console.log(temp_label);
        console.log(temp_image);

        // 3) JavaScript DOM - Weather
        let weather_images_div = document.getElementById('weather_images');
        weather_images_div.innerHTML = '';
        for(image of weather_images) {
            let para = document.createElement('p');
            let img = document.createElement('img');
            img.setAttribute("src", image);
            para.appendChild(img);
            weather_images_div.appendChild(para);
        }

        // 4) JavaScript DOM - Temperature
        let temperature_image = document.getElementById('temperature_image');
        temperature_image.setAttribute("src", temp_image);



        
    })
    .catch(error => {
        console.log(error.message);
    })
    
    console.log("=== [END] check_weather() ===");
}
