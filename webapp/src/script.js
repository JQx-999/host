function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  const dateString = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  document.getElementById('clock').textContent = timeString;
  document.getElementById('date').textContent = dateString;
}
updateClock();
setInterval(updateClock, 1000);

async function initSeamlessWeather() {
  const cityEl = document.getElementById('city-name');
  const tempEl = document.getElementById('temperature');
  const condEl = document.getElementById('weather-condition');

  if (!navigator.geolocation) {
    cityEl.textContent = "Geolocation Not Supported";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        const cityName = geoData.city || geoData.locality || geoData.principalSubdivision || "Local Area";
        const temp = Math.round(weatherData.current_weather.temperature);
        const wind = weatherData.current_weather.windspeed;
        const code = weatherData.current_weather.weathercode;

        cityEl.textContent = cityName;
        tempEl.textContent = `${temp}°C`;
        condEl.textContent = `${getWeatherDescription(code)} • Wind ${wind} km/h`;
        setDynamicWeatherTheme(code);
      } catch (err) {
        console.error("Fetch failed:", err);
        cityEl.textContent = "Weather Error";
        condEl.textContent = "Failed to load live data";
      }
    },
    (error) => {
      console.warn("Location permission denied/failed:", error.message);
      cityEl.textContent = "Location Blocked";
      condEl.textContent = "Allow location access in browser settings";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function getWeatherDescription(code) {
  if (code === 0) return 'Clear Sky ☀️';
  if (code >= 1 && code <= 3) return 'Partly Cloudy ⛅';
  if (code >= 45 && code <= 48) return 'Foggy 🌫️';
  if (code >= 51 && code <= 67) return 'Rainy 🌧️';
  if (code >= 71 && code <= 77) return 'Snowy ❄️';
  if (code >= 95) return 'Thunderstorm 🌩️';
  return 'Overcast ☁️';
}

initSeamlessWeather();

function setDynamicWeatherTheme(code) {
  const card = document.getElementById("weather");

  if (code === 0) {
    card.style.background = 'radial-gradient(circle at top left, #2c1a0e, #0e0f17)';
  }
  else if (code >= 1 && code <= 3) {
    card.style.background = 'radial-gradient(circle at top left, #1e1b2e, #0e0f17)';
  }
  else if (code >= 45 && code <= 48) {
    card.style.background = 'radial-gradient(circle at top left, #23272a, #0e0f17)';
  }
  else if (code >= 51 && code <= 67) {
    card.style.background = 'radial-gradient(circle at top left, #0d2838, #0b111e)';
  }
  else if (code >= 71 && code <= 77) {
    card.style.background = 'radial-gradient(circle at top left, #102a3a, #09131a)';
  }
  else if (code >= 95) {
    card.style.background = 'radial-gradient(circle at top left, #340c1d, #0e0f17)';
  }
  else {
    card.style.background = 'radial-gradient(circle at top left, #1a1c29, #0e0f17)';
  }
}
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');
const savedTheme = localStorage.getItem('dashboard-theme');
if (savedTheme === 'light') {
  document.body.classList.add('light-mode');
  themeIcon.textContent = '☀️';
  themeLabel.textContent = 'Light Mode';
}
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  themeIcon.textContent = isLight ? '🌙' : '☀️';
  themeLabel.textContent = isLight ? 'Dark Mode' : 'Light Mode';
  localStorage.setItem('dashboard-theme', isLight ? 'light' : 'dark');
})
document.addEventListener('keydown', (e) => {
  if (e.key === '/') {
    e.preventDefault();
    document.querySelector('input[name="q"]').focus();
  }
});
async function loadNewsFeed() {
  const container = document.getElementById('news-container');
  const rssUrl = 'https://feeds.bbci.co.uk/news/rss.xml';
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'ok') {
      container.innerHTML = '';
      data.items.slice(0, 10).forEach(item => {
        const article = document.createElement('a');
        article.className = 'news-item';
        article.href = item.link;
        article.target = '_blank';
        const imageUrl = item.thumbnail || item.enclosure?.link || 'https://via.placeholder.com/65?text=News';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.description || '';
        const cleanDescription = tempDiv.textContent || tempDiv.innerText || 'No description available.';
        article.innerHTML = `
          <img class="news-thumb" src="${imageUrl}" alt="News thumbnail" />
          <div class="news-text">
            <h3 class="news-title">${item.title}</h3>
            <p class="news-desc">${cleanDescription}</p>
          </div>
        `;

        container.appendChild(article);
      });
    } else {
      container.innerHTML = '<p class="loading">Failed to load news feed.</p>';
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    container.innerHTML = '<p class="loading">Network error loading news.</p>';
  }
}
loadNewsFeed();
