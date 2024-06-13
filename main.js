document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '9f2a08c252911f3a9584a1bc4b337561'; // Replace with your OpenWeatherMap API key

    function setWeatherIcon(element, weatherCondition) {
        const icons = {
            'Clouds': 'images/cloudy-icon.png',
            'Clear': 'images/sun-icon.png',
            'Rain': 'images/rain-icon.png',
            'Thunderstorm': 'images/thunderstorm-icon.png',
            'Default': 'images/haze.png'
        };
        const activities = {
            'Clouds': ["Hydration Boost", "Cloud Cover Yoga", "Mindfulness Moment", "Reading Break"],
            'Clear': ["Hydration Boost", "Clear Mind Meditation", "Nature Walk", "Sunshine Stretches"],
            'Rain': ["Hydration Boost", "Rainy Yoga Flow", "Rainy Meditation", "Rainy Journaling"],
            'Thunderstorm': ["Hydration Boost", "Indoor Workout", "Board Games", "Movie Marathon"],
            'Default': ["Hydration Boost", "Meditation", "Indoor Reading", "Stretching"]
        };

        element.src = icons[weatherCondition] || icons['Default'];
        updateActivities(element, ...activities[weatherCondition] || activities['Default']);
    }

    function updateActivities(element, activity1, activity2, activity3, activity4) {
        let activityElements = [];
        
        if (element.classList.contains('w-icon')) {
            activityElements = document.querySelectorAll('.home-activity-card .home-activity, .weather-activity-card .weather-activity');
        } else if (element.closest('.forecast-card')) {
            const parentCard = element.closest('.forecast-card');
            activityElements = parentCard.nextElementSibling.querySelectorAll('.forecast-activity');
        } else {
            activityElements = document.querySelectorAll('.home-activity-card .home-activity, .weather-activity-card .weather-activity');
        }
        
        if (activityElements && activityElements.length >= 4) {
            [activity1, activity2, activity3, activity4].forEach((activity, index) => {
                activityElements[index].textContent = activity;
            });
        }
    }
    

    function toTitleCase(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    function updateTodayDate() {
        const today = moment().format('dddd, D MMMM YYYY');
        const dateElement = document.getElementById('weather-today-date');
        if (dateElement) {
            dateElement.textContent = today;
        }
    }

    function fetchWeather(lat, lon) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const { name, sys, main, weather, wind } = data;
                const locationElement = document.querySelector('.location');
                const tempElement = document.querySelector('.w-temp');
                const conditionElement = document.querySelector('.condition');
                const humidityElement = document.querySelector('.weather-item .value');
                const windSpeedElement = document.querySelector('.weather-item:nth-child(2) .value');
                const weatherIcon = document.querySelector('.w-icon');

                if (locationElement) locationElement.textContent = `${name}, ${sys.country}`;
                if (tempElement) tempElement.innerHTML = `${Math.round(main.temp)}&deg;C`;
                if (conditionElement) conditionElement.textContent = toTitleCase(weather[0].description);
                if (humidityElement) humidityElement.textContent = `${main.humidity}%`;
                if (windSpeedElement) windSpeedElement.textContent = `${wind.speed} km/h`;
                if (weatherIcon) setWeatherIcon(weatherIcon, weather[0].main);
            })
            .catch(error => console.error('Error fetching weather data:', error));

        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const forecastContainer = document.querySelector('.forecast-container');
                const forecastList = data.list;
                const dailyForecasts = {};

                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowDateString = tomorrow.toISOString().split('T')[0];

                forecastList.forEach((reading) => {
                    const date = reading.dt_txt.split(' ')[0];
                    if (date >= tomorrowDateString) {
                        if (!dailyForecasts[date]) {
                            dailyForecasts[date] = {
                                icon: reading.weather[0].main,
                                minTemp: reading.main.temp_min,
                                maxTemp: reading.main.temp_max
                            };
                        } else {
                            if (reading.main.temp_min < dailyForecasts[date].minTemp) {
                                dailyForecasts[date].minTemp = reading.main.temp_min;
                            }
                            if (reading.main.temp_max > dailyForecasts[date].maxTemp) {
                                dailyForecasts[date].maxTemp = reading.main.temp_max;
                            }
                        }
                    }
                });

                let forecastHTML = '';
                Object.keys(dailyForecasts).forEach(date => {
                    forecastHTML += `
                        <div class="forecast-card">
                            <div class="day" id="forecast-date">${moment(date).format('ddd')}</div>
                            <img src="images/sun-icon.png" alt="weather icon" class="f-icon" id="forecast-icon" data-weather="${dailyForecasts[date].icon}">
                            <div class="temp" id="forecast-temp">${Math.round(dailyForecasts[date].minTemp)}&#176;C - ${Math.round(dailyForecasts[date].maxTemp)}&#176;C</div>
                            <div class="condition" id="forecast-condition">${dailyForecasts[date].icon}</div>
                        </div>
                        <div class="forecast-activity-container">
                            <div class="sub-text" id="forecast-subtext">Recommended Activities</div>
            
                            <div class="activity-cards">
                                <div class="forecast-activity-card">
                                    <img src="images/f-activity-card-blue.png" alt="activity card">
                                    <div class="forecast-activity" id="activity1">Hydration Boost</div>
                                </div>

                                <div class="forecast-activity-card">
                                    <img src="images/f-activity-card-red.png" alt="activity card">
                                    <div class="forecast-activity" id="activity2">Clear Mind Meditation</div>
                                </div>

                                <div class="forecast-activity-card">
                                    <img src="images/f-activity-card-yellow.png" alt="activity card">
                                    <div class="forecast-activity" id="activity3">Hydration Boost</div>
                                </div>

                                <div class="forecast-activity-card">
                                    <img src="images/f-activity-card-green.png" alt="activity card">
                                    <div class="forecast-activity" id="activity4">Hydration Boost</div>
                                </div>
                            </div>
                        </div>
                    `;
                });

                forecastContainer.innerHTML = forecastHTML;

                document.querySelectorAll('.f-icon').forEach(icon => {
                    setWeatherIcon(icon, icon.getAttribute('data-weather'));
                });
            })
            .catch(error => console.error('Error fetching forecast data:', error));
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude: lat, longitude: lon } = position.coords;
                fetchWeather(lat, lon);
            }, error => {
                console.error('Error getting location: ', error);
                fetchWeather(1.5377, 103.6572); // Fallback location (e.g., Skudai, Johor)
            });
        } else {
            console.error('Geolocation is not supported by this browser.');
            fetchWeather(1.5377, 103.6572); // Fallback location (e.g., Skudai, Johor)
        }
    }

    function initializeEventListeners() {
        const weatherBanner = document.querySelector('.main-weather-banner');
        const backButton = document.querySelector('.w-back-button');
        const forecastIcon = document.querySelector('.weather-forecast-icon');
        const activateButton = document.getElementById('activate-button');
        const fbackButton = document.getElementById('f-backButton');
        const hweatherBanner = document.querySelector('.home-weather-banner');
        const activityCard = document.getElementById('activity-hydration');
        const abackButton = document.getElementById('a-backButton');
        const startButton = document.getElementById('start-button');
        const continueButton = document.querySelector('.continue-button');
        const plusButton = document.querySelector('.ic--round-plus');
        const minusButton = document.querySelector('.ic--round-minus');
        const levelDisplay = document.querySelector('.level');
        const waterLevelImage = document.querySelector('.waterlevel');
        const addButton = document.getElementById('add-button');
        let currentLevel = 0;

        const waterLevels = [
            'images/water-level-0.png',
            'images/water-level-1.png',
            'images/water-level-2.png',
            'images/water-level-3.png',
        ];    

        if (weatherBanner) weatherBanner.addEventListener("click", () => window.location.href = "2-weather.html");
        if (backButton) backButton.addEventListener('click', () => window.location.href = 'index.html');
        if (forecastIcon) forecastIcon.addEventListener('click', () => window.location.href = '2.1-forecast.html');
        if (activateButton) activateButton.addEventListener('click', () => window.location.href = '3-home.html');
        if (fbackButton) fbackButton.addEventListener('click', () => window.location.href = '2-weather.html');
        if (hweatherBanner) hweatherBanner.addEventListener("click", () => window.location.href = "2-weather.html");
        if (activityCard) activityCard.addEventListener('click', () => window.location.href = 'activity-1.html');
        if (abackButton) abackButton.addEventListener('click', () => window.location.href = '3-home.html');
        if (startButton) startButton.addEventListener('click', () => window.location.href = 'activity-2.html');
        if (continueButton) continueButton.addEventListener("click", () => window.location.href = "3-home.html");

        if (plusButton && minusButton && levelDisplay && waterLevelImage && addButton) {
            plusButton.addEventListener('click', () => {
                if (currentLevel < 300) {
                    currentLevel += 100;
                    levelDisplay.textContent = `${currentLevel} ml`;
                    updateWaterLevelImage();
                }
            });

            minusButton.addEventListener('click', () => {
                if (currentLevel > 0) {
                    currentLevel -= 100;
                    levelDisplay.textContent = `${currentLevel} ml`;
                    updateWaterLevelImage();
                }
            });

            addButton.addEventListener('click', () => {
                console.log('Water added:', currentLevel, 'ml');
                if (currentLevel === 300) {
                    window.location.href = 'activity-3.html';
                } else {
                    currentLevel = 0;
                    levelDisplay.textContent = `${currentLevel} ml`;
                    updateWaterLevelImage();
                }
            });

            levelDisplay.textContent = `${currentLevel} ml`;
            updateWaterLevelImage();
        }

        function updateWaterLevelImage() {
            const levelIndex = currentLevel / 100;
            if (levelIndex >= 0 && levelIndex < waterLevels.length) {
                waterLevelImage.src = waterLevels[levelIndex];
            }
        }
    }

    updateTodayDate();
    getLocation();
    initializeEventListeners();
});
