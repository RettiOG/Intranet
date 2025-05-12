async function fetchWeather() {
    const city = 'Eslohe,de';
    const apiKey = '9acdf8b53bda7af0a38a34f2ba33dfc5';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=de&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Stadt nicht gefunden');
        }

        const data = await response.json();
        const weatherInfoDiv = document.getElementById('weather-info');
        weatherInfoDiv.innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <p>${data.weather[0].description}</p>
            <p>Temperatur: ${data.main.temp} °C</p>
            <p>Gefühlt: ${data.main.feels_like} °C</p>
            <p>Luftfeuchtigkeit: ${data.main.humidity}%</p>
        `;
    } catch (error) {
        const weatherInfoDiv = document.getElementById('weather-info');
        weatherInfoDiv.innerHTML = `<p>Fehler: ${error.message}</p>`;
    }
}

// Abrufen der Wetterdaten alle 60 Sekunden
fetchWeather();
setInterval(fetchWeather, 240000);
