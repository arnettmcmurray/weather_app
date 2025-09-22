const API_KEY = "YOUR_API_KEY_HERE"; // still placeholder

let unit = "imperial"; // commit 4: tracking current unit

const form = document.getElementById("weather-form");
const cityInput = document.getElementById("cityInput");
const unitSelect = document.getElementById("unitSelect");

// commit 4: update unit on change
unitSelect.addEventListener("change", () => {
  unit = unitSelect.value;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const cityOrZip = cityInput.value.trim();
  if (!cityOrZip) return;

  if (/^\d+$/.test(cityOrZip)) {
    await getWeatherByZip(cityOrZip);
  } else {
    await getWeatherByCity(cityOrZip);
  }
});

async function getWeatherByZip(zip) {
  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${API_KEY}&units=${unit}`;
  await fetchWeather(url);
}

async function getWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=${unit}`;
  await fetchWeather(url);
}

async function fetchWeather(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Location not found");
    const data = await response.json();
    updateWeather(data, `${data.name}, ${data.sys.country}`);
  } catch (err) {
    const el = document.getElementById("error");
    el.textContent = err.message;
    el.hidden = false;
  }
}

function updateWeather(data, locationLabel) {
  document.getElementById("error").hidden = true;
  document.getElementById("high").textContent = `${data.main.temp_max} °${
    unit === "imperial" ? "F" : "C"
  }`;
  document.getElementById("low").textContent = `${data.main.temp_min} °${
    unit === "imperial" ? "F" : "C"
  }`;
  document.getElementById("forecast").textContent = data.weather[0].description;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;

  if (locationLabel) {
    document
      .getElementById("results")
      .insertAdjacentHTML("afterbegin", `<h2>${locationLabel}</h2>`);
  }
}
