// swap key here before push, dont leak real one
const API_KEY = "YOUR_API_KEY_HERE";

const form = document.getElementById("weather-form");
const cityInput = document.getElementById("cityInput");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;

  try {
    // Step 1: Geocode city -> lat/lon
    const geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      city
    )}&limit=1&appid=${API_KEY}`;
    const geoResp = await fetch(geoURL);
    const geoData = await geoResp.json();

    if (!geoData || geoData.length === 0) throw new Error("City not found");

    const { lat, lon, name, country } = geoData[0];

    // Step 2: Weather by lat/lon
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;
    const weatherResp = await fetch(weatherURL);
    if (!weatherResp.ok) throw new Error("Weather data not found");

    const weatherData = await weatherResp.json();

    // Step 3: Update DOM
    updateWeather(weatherData, `${name}, ${country}`);
  } catch (err) {
    document.getElementById("error").textContent = err.message;
    document.getElementById("error").hidden = false;
  }
});

function updateWeather(data, locationLabel) {
  document.getElementById("error").hidden = true;

  document.getElementById("high").textContent = `${data.main.temp_max} °F`;
  document.getElementById("low").textContent = `${data.main.temp_min} °F`;
  document.getElementById("forecast").textContent = data.weather[0].description;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;

  // === later: temp conversions go here ===
  // idea: show °C too, or add toggle
  // not assignment requirement, leave for polish

  if (locationLabel) {
    document
      .getElementById("results")
      .insertAdjacentHTML("afterbegin", `<h2>${locationLabel}</h2>`);
  }
}
