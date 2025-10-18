import React, { useState } from 'react';
import axios from 'axios';
import '../css/weather.css'; // adjust path if needed

const weatherTypeImages = {
  "Clear": "/img/weather/clear.jpg",
  "Clouds": "/img/weather/clouds.jpg",
  "Haze": "/img/weather/haze.jpg",
  "Mist": "/img/weather/mist.jpg",
  "Rain": "/img/weather/rain.jpg",
  "Smoke": "/img/weather/smoke.jpg",
  "Snow": "/img/weather/snow.jpg",
  "Thunderstorm": "/img/weather/thunderstorm.jpg"
};

function Weather() {
const [weatherImages, setWeatherImages] = useState([]);
const [locationError, setLocationError] = useState(null);
const [weatherDescription, setWeatherDescription] = useState('');



  const checkWeather = () => {
    console.log("Checking weather...");
    const weather_api_key = 'bbc23dde07349494203ae99ffadebca4';

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

          try {
            const apiEndpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weather_api_key}&units=metric`;
            const response = await axios.get(apiEndpoint);

            const images = response.data.weather.map(w => weatherTypeImages[w.main] || null).filter(Boolean);
            setWeatherImages(images);
            setWeatherDescription(response.data.weather[0].main);

          } catch (error) {
            console.error('API Error:', error.message);
          }
        },
        (error) => {
          console.error('Geolocation error:', error.message);
          setLocationError("Could not get your location.");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("Geolocation not supported.");
    }
  };

  return (
    <>
      <div className="container">
        <div id="weather_description" className="text-center">
          <div id="weather_text"></div>

            <div id="weather_images" className="d-flex justify-content-center flex-wrap gap-3">
              {weatherImages.length > 0 ? (
                weatherImages.map((src, index) => (
                  <div className="weather-icon" key={index}>
                    <img src={src} alt={`Weather condition ${index}`} />
                  </div>
                ))
              ) : (
                <>
                  <div className="weather-icon">
                    <img src="/img/weather/sun_icon.png" alt="Sunny" />
                  </div>
                  <div className="weather-icon">
                    <img src="/img/weather/cloud_icon.png" alt="Cloudy" />
                  </div>
                  <div className="weather-icon">
                    <img src="/img/weather/thunder_icon.png" alt="Stormy" />
                  </div>
                </>
              )}
            </div>

        </div>

        <div className="mb-3 text-center" id="temp">

          <h3>The weather in your area right now is...</h3>
            {weatherDescription && (
              <>
                <h1>{weatherDescription}</h1>
              </>
            )}
          <button className="btn btn-primary" onClick={checkWeather}>Sync now!</button>
        </div>
      </div>
      
    </>
  );
}

export default Weather;
