// ======================================================
// ELEMENTS
// ======================================================

const form = document.getElementById("searchForm");
const input = document.getElementById("cityInput");

const bgVideo = document.getElementById("bgVideo");
const overlay = document.querySelector(".video-overlay");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const weatherSymbol = document.getElementById("weatherSymbol");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const rain = document.getElementById("rain");

const error = document.getElementById("error");
const localTime = document.getElementById("localTime");

// PAGE LOAD → VIDEO HIDE
if (bgVideo) {
    bgVideo.style.display = "none";
}

// ======================================================
// SEARCH FORM
// ======================================================

if (form) {
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        searchWeather();
    });
}

// ======================================================
// SEARCH WEATHER
// ======================================================

async function searchWeather() {

    const city = input.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        input.focus();
        return;
    }

    showError("");

    cityName.textContent = "Searching...";
    countryName.textContent = "";

    try {

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json`;

        const geoResponse = await fetch(geoURL);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found");
        }

        const place = geoData.results[0];

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);
        const weatherData = await weatherResponse.json();

        if (!weatherData.current) {
            throw new Error("Weather unavailable");
        }

        updateWeather(place, weatherData.current, weatherData.timezone);

    } catch (err) {

        console.error(err);

        cityName.textContent = "Search a city";
        countryName.textContent = "";

        showError("Couldn't find weather for that location.");
    }
}

// ======================================================
// UPDATE WEATHER
// ======================================================

function updateWeather(place, current, timezone) {

    cityName.textContent = place.name || "Unknown";
    countryName.textContent = place.country_code
        ? `· ${place.country_code}`
        : "";

    temperature.textContent = Math.round(current.temperature_2m);
    feelsLike.textContent = Math.round(current.apparent_temperature);
    humidity.textContent = current.relative_humidity_2m;
    wind.textContent = Math.round(current.wind_speed_10m);
    rain.textContent = current.precipitation ?? 0;

    const weather = getWeatherInfo(
        current.weather_code,
        current.is_day
    );

    // TIME + DATE
    if (localTime && timezone) {

        const now = new Date();

        const time = new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: timezone
        }).format(now);

        const date = new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: timezone
        }).format(now);

        localTime.textContent = `${time} • ${date}`;
    }

    condition.textContent = weather.name;
    weatherSymbol.textContent = weather.icon;

    changeWeatherBackground(weather.type, current.is_day);
}

// ======================================================
// WEATHER TYPES
// ======================================================

function getWeatherInfo(code, isDay) {

    if (code === 0) {
        return isDay
            ? { name: "Clear sky", icon: "☀️", type: "clear" }
            : { name: "Clear night", icon: "🌙", type: "clearnight" };
    }

    if (code === 1) {
        return isDay
            ? { name: "Mainly clear", icon: "🌤️", type: "partlycloudy" }
            : { name: "Mainly clear", icon: "🌙", type: "clearnight" };
    }

    if (code === 2) return { name: "Partly cloudy", icon: "⛅", type: "partlycloudy" };
    if (code === 3) return { name: "Overcast", icon: "☁️", type: "overcast" };
    if ([45, 48].includes(code)) return { name: "Foggy", icon: "🌫️", type: "fog" };

    if ([61, 63].includes(code)) return { name: "Rain", icon: "🌧️", type: "rain" };
    if (code === 65) return { name: "Heavy rain", icon: "🌧️", type: "heavyrain" };

    if ([71, 77].includes(code)) return { name: "Snow", icon: "❄️", type: "lightsnow" };

    if (code === 95) return { name: "Thunderstorm", icon: "⛈️", type: "thunderstorm" };

    return { name: "Weather", icon: "🌍", type: "overcast" };
}

// ======================================================
// BACKGROUND VIDEO (FIXED)
// ======================================================

function changeWeatherBackground(type, isDay) {

    bgVideo.style.display = "block";

    const videos = {

        clear: "https://res.cloudinary.com/cqu9fnnf/video/upload/v1786261447/sunny.mp4",
        clearnight: "https://res.cloudinary.com/cqu9fnnf/video/upload/v1786261315/clear_night.mp4",
        partlycloudy: "https://res.cloudinary.com/cqu9fnnf/video/upload/v1786261508/partly_cloudy.mp4",
        overcast: "https://res.cloudinary.com/cqu9fnnf/video/upload/v1786261352/over_cast.mp4",
        cloudy: "https://res.cloudinary.com/cqu9fnnf/video/upload/v1786261387/cloudy.mp4",
        fog: "https://res.cloudinary.com/cqu9fnnf/video/upload/v1786261358/foggy.mp4",
        drizzle: "https://res.cloudinary.com/cqu9fnnf/video/upload/v1786261337/light_rain.mp4",
        rain: "https://res.cloudinary.com/cqu9fnnf/video/upload/v1786262111/rain.mp4",
        heavyrain: "https://res.cloudinary.com/cqu9fnnf/video/upload/v1786261372/heavy_rain.mp4",
        lightsnow: "https://res.cloudinary.com/cqu9fnnf/video/upload/v1786261462/snowy.mp4",
        heavysnow: "https://res.cloudinary.com/cqu9fnnf/video/upload/v1786261451/heavy_snow.mp4",
        thunderstorm: "https://res.cloudinary.com/cqu9fnnf/video/upload/v1786261402/thunder_storm.mp4",
        lightning: "https://res.cloudinary.com/cqu9fnnf/video/upload/v1786261352/lightning.mp4"
    };

    const videoFile = videos[type];

    if (!videoFile) {
        console.log("No video for:", type);
        return;
    }

    bgVideo.pause();
    bgVideo.src = "";
    bgVideo.load();

    setTimeout(() => {
        bgVideo.src = videoFile;
        bgVideo.load();
        bgVideo.play().catch(() => {});
    }, 100);

    if (overlay) {
        overlay.style.background = isDay
            ? "linear-gradient(135deg, rgba(5,12,25,.38), rgba(10,20,40,.18))"
            : "linear-gradient(135deg, rgba(3,7,18,.65), rgba(5,10,25,.48))";
    }
}

// ======================================================
// ERROR
// ======================================================

function showError(message) {
    if (!error) return;

    error.textContent = message;
    error.classList.toggle("hidden", !message);
}