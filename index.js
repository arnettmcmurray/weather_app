// Read API key from local config (config.local.js). Fallback to placeholder.
const API_KEY = window.OPENWEATHER_API_KEY || "YOUR_API_KEY_HERE";

let unit = "imperial";
let savedCoords = null;

const form = document.getElementById("weather-form");
const cityInput = document.getElementById("cityInput");
const unitSelect = document.getElementById("unitSelect");
const forecastBtn = document.getElementById("forecast-btn");

unitSelect.addEventListener("change", () => {
  unit = unitSelect.value;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const cityOrZip = cityInput.value.trim();
  if (!cityOrZip) return;

  // clear labels / forecast on new search
  document.getElementById("forecast-container").innerHTML = "";
  document.getElementById("error").hidden = true;

  if (/^\d+$/.test(cityOrZip)) {
    await getWeatherByZip(cityOrZip);
  } else {
    await getWeatherByCity(cityOrZip);
  }
});

async function getWeatherByZip(zip) {
  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},US&appid=${API_KEY}&units=${unit}`;
  await fetchWeather(url);
}

async function getWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )},US&appid=${API_KEY}&units=${unit}`;
  await fetchWeather(url);
}

async function fetchWeather(url) {
  try {
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
      throw new Error("Missing API key. Add your key to config.local.js.");
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Location not found");
    const data = await response.json();

    savedCoords = data.coord; // stash for forecast
    updateWeather(data);
    updateCoords(savedCoords);
  } catch (err) {
    const el = document.getElementById("error");
    el.textContent = err.message;
    el.hidden = false;
  }
}

function updateWeather(data) {
  const loc = `${data.name}, ${data.sys.country}`;
  document.getElementById("locationLabel").textContent = loc;

  document.getElementById("high").textContent = `${data.main.temp_max} °${
    unit === "imperial" ? "F" : "C"
  }`;
  document.getElementById("low").textContent = `${data.main.temp_min} °${
    unit === "imperial" ? "F" : "C"
  }`;
  document.getElementById("forecast").textContent = data.weather[0].description;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
}

function updateCoords(coord) {
  if (!coord) {
    document.getElementById("coords").textContent = "—";
    return;
  }
  document.getElementById(
    "coords"
  ).textContent = `Lat: ${coord.lat}, Lon: ${coord.lon}`;
}

forecastBtn.addEventListener("click", async () => {
  if (!savedCoords) {
    alert("Search a city or zip first.");
    return;
  }
  await fetchForecast(savedCoords.lat, savedCoords.lon);
});

async function fetchForecast(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast not available");
    const data = await response.json();

    const container = document.getElementById("forecast-container");
    container.innerHTML = "";

    // group entries by date and take the first entry for each day
    const byDate = {};
    for (const item of data.list) {
      const key = new Date(item.dt_txt).toLocaleDateString();
      if (!byDate[key]) byDate[key] = item;
    }
    const days = Object.values(byDate).slice(0, 3);

    days.forEach((day) => {
      const wrap = document.createElement("div");
      wrap.className = "mini-card card"; // ensure themed style

      wrap.innerHTML = `
        <h4>${new Date(day.dt_txt).toLocaleDateString()}</h4>
        <p>${day.main.temp_min} / ${day.main.temp_max} °${
        unit === "imperial" ? "F" : "C"
      }</p>
        <p>${day.weather[0].description}</p>
      `;
      container.appendChild(wrap);
    });
  } catch (err) {
    console.error("Forecast error:", err.message);
  }
}
