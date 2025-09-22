// Read API key from local config (config.local.js). Fallback to placeholder.
// — keeping this pattern so we can ship to GitHub safely later.
const API_KEY = window.OPENWEATHER_API_KEY || "YOUR_API_KEY_HERE";

let unit = "imperial";
let savedCoords = null;

const form = document.getElementById("weather-form");
const cityInput = document.getElementById("cityInput");
const unitSelect = document.getElementById("unitSelect");
const forecastBtn = document.getElementById("forecast-btn");

unitSelect.addEventListener("change", () => {
  unit = unitSelect.value;
  // NOTE: not auto-refreshing the current city on unit change — simple first.
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const cityOrZip = cityInput.value.trim();
  if (!cityOrZip) return;

  // reset forecast/results on new search
  document.getElementById("forecast-container").innerHTML = "";
  document.getElementById("forecast-cards").hidden = true;
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

  // rounding temps for cleaner look
  const hi = Math.round(data.main.temp_max);
  const lo = Math.round(data.main.temp_min);
  const u = unit === "imperial" ? "F" : "C";

  document.getElementById("high").textContent = `${hi} °${u}`;
  document.getElementById("low").textContent = `${lo} °${u}`;
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

    // === Trying improvement here (can revert): compute daily min/max ===
    // Group 3h blocks by local date
    const groups = new Map();
    for (const item of data.list) {
      const key = new Date(item.dt_txt).toLocaleDateString();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }

    // Take the next 3 distinct days
    const days = [...groups.keys()].slice(0, 3);

    days.forEach((dateKey) => {
      const items = groups.get(dateKey);

      // min of temp_min, max of temp_max across the day
      const min = Math.round(Math.min(...items.map((i) => i.main.temp_min)));
      const max = Math.round(Math.max(...items.map((i) => i.main.temp_max)));

      // pick an icon from around midday if present, else first item
      let pick = items.find((i) => /12:00:00/.test(i.dt_txt)) || items[0];
      const iconCode = pick.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

      const wrap = document.createElement("div");
      wrap.className = "mini-card card"; // reuse shadows

      const u = unit === "imperial" ? "F" : "C";
      wrap.innerHTML = `
        <h4>${dateKey}</h4>
        <img class="wx-icon" src="${iconUrl}" alt="${pick.weather[0].main}" />
        <p>${min} / ${max} °${u}</p>
        <p>${pick.weather[0].description}</p>
      `;
      container.appendChild(wrap);
    });

    // reveal section header only when data exists
    document.getElementById("forecast-cards").hidden = days.length === 0;
  } catch (err) {
    console.error("Forecast error:", err.message);
  }
}

/* === Parking lot (future if Dylan extends) ===
- Geolocation button (navigator.geolocation) → use coords directly.
- Persist last search + unit in localStorage; auto-load on refresh.
- Add sunrise/sunset chips (sys.sunrise/sunset via /weather).
- “Feels like” and wind speed badges under the main location line.
- °F/°C toggle should refetch and re-render immediately.
- Simple skeleton/loading state on search and forecast clicks.
- Error states per field (zip vs city) with inline notes.
*/
