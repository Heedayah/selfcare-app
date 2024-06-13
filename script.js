document.addEventListener('DOMContentLoaded', () => { 
    const apiKey = '9f2a08c252911f3a9584a1bc4b337561'; // Replace with your OpenWeatherMap API key

    // Function to set weather icon and update activities based on weather condition
    function setWeatherIcon(element, weatherCondition) {
        console.log(`Setting icon for condition: ${weatherCondition}`); // Debug log
        switch (weatherCondition) {
            case 'Clouds':
                element.src = 'images/cloudy-icon.png';
                updateActivities(element, "Hydration Boost", "Cloud Cover Yoga", "Mindfulness Moment", "Reading Break");
                break;
            case 'Clear':
                element.src = 'images/sun-icon.png';
                updateActivities(element, "Hydration Boost", "Clear Mind Meditation", "Nature Walk", "Sunshine Stretches");
                break;
            case 'Rain':
                element.src = 'images/rain-icon.png';
                updateActivities(element, "Hydration Boost", "Rainy Yoga Flow", "Rainy Meditation", "Rainy Journaling");
                break;
            case 'Thunderstorm':
                element.src = 'images/thunderstorm-icon.png';
                updateActivities(element, "Hydration Boost", "Indoor Workout", "Board Games", "Movie Marathon");
                break;
            default:
                element.src = 'images/haze.png';
                updateActivities(element, "Hydration Boost", "Meditation", "Indoor Reading", "Stretching");
        }
    }

     // Function to update activities based on weather condition
     function updateActivities(element, activity1, activity2, activity3, activity4) {
        let activityElements;
        
        if (element.classList.contains('w-icon')) {
            // Updating the weather page activities
            activityElements = document.querySelectorAll('.weather-activity-card .activity');
        } else if (element.closest('.forecast-card')) {
            // Updating the forecast page activities
            const parentCard = element.closest('.forecast-card');
            activityElements = parentCard.nextElementSibling.querySelectorAll('.forecast-activity');
        } else {
            // Updating the home page activities
            activityElements = document.querySelectorAll('.home-activity-card .home-activity');
        }
        
        if (activityElements.length >= 4) {
            activityElements[0].textContent = activity1;
            activityElements[1].textContent = activity2;
            activityElements[2].textContent = activity3;
            activityElements[3].textContent = activity4;
        }
    }

    function updateDescription(element, description1, description2, description3, description4){

    }
    
    // Function to capitalize each word in a string
    function toTitleCase(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    // Function to fetch weather data based on latitude and longitude
    function fetchWeather(lat, lon) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const locationElement = document.querySelector('.location');
                const tempElement = document.querySelector('.w-temp');
                const conditionElement = document.querySelector('.condition');
                const humidityElement = document.querySelector('.weather-item .value');
                const windSpeedElement = document.querySelector('.weather-item:nth-child(2) .value');
                const weatherIcon = document.querySelector('.w-icon');

                if (locationElement) locationElement.textContent = `${data.name}, ${data.sys.country}`;
                if (tempElement) tempElement.innerHTML = `${Math.round(data.main.temp)}&deg;C`;
                if (conditionElement) conditionElement.textContent = toTitleCase(data.weather[0].description);
                if (humidityElement) humidityElement.textContent = `${data.main.humidity}%`;
                if (windSpeedElement) windSpeedElement.textContent = `${data.wind.speed} km/h`;
                if (weatherIcon) setWeatherIcon(weatherIcon, data.weather[0].main);
            });

            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const forecastContainer = document.querySelector('.forecast-container');
                const forecastList = data.list;
                const dailyForecasts = {};

                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1); // Get tomorrow's date
                const tomorrowDateString = tomorrow.toISOString().split('T')[0]; // Format tomorrow's date as 'yyyy-mm-dd'

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
                            <div class="temp" id="forecast-temp">Day - ${Math.round(dailyForecasts[date].maxTemp)}&deg;C</div>
                            <div class="temp" id="forecast-temp">Night - ${Math.round(dailyForecasts[date].minTemp)}&deg;C</div>
                        </div>

                        <div class="forecast-activity-container">
                            <div class="sub-text" id="forecast-subtext">Recommended Activities</div>
                        
                            <div class="activity-cards">
                                <div class="forecast-activity-card">
                                    <img src="images/f-activity-card-blue.png" alt="activity card">
                                    <div class="forecast-activity" id="activity1"></div>
                                </div>
            
                                <div class="forecast-activity-card">
                                    <img src="images/f-activity-card-red.png" alt="activity card">
                                    <div class="forecast-activity" id="activity2"></div>
                                </div>
            
                                <div class="forecast-activity-card">
                                    <img src="images/f-activity-card-yellow.png" alt="activity card">
                                    <div class="forecast-activity" id="activity3"></div>
                                </div>
            
                                <div class="forecast-activity-card">
                                    <img src="images/f-activity-card-green.png" alt="activity card">
                                    <div class="forecast-activity" id="activity4"></div>
                                </div>
                            </div>
                        </div>
                    `;
                });

                forecastContainer.innerHTML = forecastHTML;

                // Set icons and activities for forecast cards
                document.querySelectorAll('.f-icon').forEach(icon => {
                    setWeatherIcon(icon, icon.getAttribute('data-weather'));
                });
            });  
    }


    // Get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeather(lat, lon);
        }, error => {
            console.error('Error getting location: ', error);
            // Fallback location (e.g., Skudai, Johor) if location access is denied or fails
            const fallbackLat = 1.5377;
            const fallbackLon = 103.6572;
            fetchWeather(fallbackLat, fallbackLon);
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        // Fallback location (e.g., Skudai, Johor) if geolocation is not supported
        const fallbackLat = 1.5377;
        const fallbackLon = 103.6572;
        fetchWeather(fallbackLat, fallbackLon);
    }


    //Function for interaction

    //1-main.html
    const weatherBanner = document.querySelector('.main-weather-banner');

    weatherBanner.addEventListener("click", function() {
        
        window.location.href = "2-weather.html";
    });


    //2-weather.html
    const wbackButton = document.querySelector('w-back-button');

    wbackButton.addEventListener("click", function() {
        
        window.location.href = "1-main.html";
    });

    const forecastButton = document.querySelector('.weather-forecast-icon');

    forecastButton.addEventListener("click", function() {
        
        window.location.href = "2.1-forecast.html";
    });

    const activateButton = document.getElementById('activate-button');

    activateButton.addEventListener("click", function() {
        
        window.location.href = "3-home.html";
    });

    //2.1-forecast.html
    const fbackButton = document.getElementById('f-backButton');

    fbackButton.addEventListener('click', () => {
        window.location.href = '2-weather.html'; // Navigate to 2-weather.html
    });

    //3-home.html
    const hweatherBanner = document.querySelector('.home-weather-banner');

    hweatherBanner.addEventListener("click", function() {
            
        window.location.href = "2-weather.html";
    });

    const hydrationCard = document.getElementById('activity-hydration');

    hydrationCard.addEventListener('click', () => {
        window.location.href = 'activity-1.html'; 
    });

    //activity-1.html
    const abackButton = document.getElementById('a-backButton');

    abackButton.addEventListener('click', () => {
        window.location.href = '3-home.html'; 
    });

    //activity-2.html

        //Function for hydration activity
        const plusButton = document.querySelector('.ic--round-plus');
        const minusButton = document.querySelector('.ic--round-minus');
        const levelDisplay = document.querySelector('.level');
        const waterLevelImage = document.querySelector('.waterlevel');
        const startButton = document.getElementById('start-button');
        let currentLevel = 0;
    
        const waterLevels = [
            'images/water-level-0.png',
            'images/water-level-1.png',
            'images/water-level-2.png',
            'images/water-level-3.png',
        ];
    
        function updateWaterLevelImage() {
            const levelIndex = currentLevel / 100;
            if (levelIndex >= 0 && levelIndex < waterLevels.length) {
                waterLevelImage.src = waterLevels[levelIndex];
            }
        }
    
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
    
        startButton.addEventListener('click', () => {
            console.log('Water added:', currentLevel, 'ml');
            if (currentLevel === 300) {
                window.location.href = 'activity-3.html'; // Navigate to activity3.html
            } else {
                // Reset the water level after adding water
                currentLevel = 0;
                levelDisplay.textContent = `${currentLevel} ml`;
                updateWaterLevelImage();
            }
        });
    
        // Initialize the water level display
        levelDisplay.textContent = `${currentLevel} ml`;
        updateWaterLevelImage();
});