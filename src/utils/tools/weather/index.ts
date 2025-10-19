interface WeatherReturnProps {
  status: boolean;
  content?: string;
}

const Weather = async ({
  location,
}: {
  location: string;
}): Promise<WeatherReturnProps> => {
  try {
    if (!location || location.trim().length < 2) {
      return {
        status: false,
        content: "Please provide a valid location name.",
      };
    }

    // Using Open-Meteo API (free, no API key required)
    // First, geocode the location
    const geoController = new AbortController();
    const geoTimeout = setTimeout(() => geoController.abort(), 5000);

    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        location,
      )}&count=1&language=en&format=json`,
      { signal: geoController.signal },
    );
    clearTimeout(geoTimeout);

    if (!geoResponse.ok) {
      return {
        status: false,
        content: "Unable to find the specified location.",
      };
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      return {
        status: false,
        content: "Location not found. Please try a different location name.",
      };
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // Get weather data
    const weatherController = new AbortController();
    const weatherTimeout = setTimeout(() => weatherController.abort(), 5000);

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature,precipitation,pressure_msl,visibility&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,precipitation_probability_max&hourly=temperature_2m,weather_code,precipitation_probability&temperature_unit=celsius&wind_speed_unit=kmh&forecast_days=7&timezone=auto`,
      { signal: weatherController.signal },
    );
    clearTimeout(weatherTimeout);

    if (!weatherResponse.ok) {
      return {
        status: false,
        content: "Unable to fetch weather data.",
      };
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    // Map weather codes to conditions
    const weatherConditions: { [key: number]: string } = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Foggy",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };

    const condition =
      weatherConditions[current.weather_code] || "Unknown condition";

    // Helper function to get condition from code
    const getCondition = (code: number) =>
      weatherConditions[code] || "Unknown condition";

    // Build current weather info
    let weatherInfo = [
      `**Location:** ${name}, ${country}`,
      `**Current Weather:**`,
      `  Temperature: ${Math.round(current.temperature_2m)}°C (Feels like: ${Math.round(current.apparent_temperature)}°C)`,
      `  Condition: ${condition}`,
      `  Humidity: ${current.relative_humidity_2m}%`,
      `  Wind Speed: ${Math.round(current.wind_speed_10m)} km/h`,
      `  Precipitation: ${current.precipitation} mm`,
      `  Pressure: ${Math.round(current.pressure_msl)} hPa`,
      `  Visibility: ${Math.round(current.visibility / 1000)} km`,
    ].join("\n");

    // Add hourly forecast (next 12 hours)
    if (weatherData.hourly) {
      weatherInfo += "\n\n**Hourly Forecast (Next 12 Hours):**\n";
      const now = new Date();
      const currentHour = now.getHours();
      for (let i = 0; i < 12; i++) {
        const hourIndex = i;
        const hour = (currentHour + i) % 24;
        const temp = Math.round(weatherData.hourly.temperature_2m[hourIndex]);
        const cond = getCondition(weatherData.hourly.weather_code[hourIndex]);
        const precipProb =
          weatherData.hourly.precipitation_probability[hourIndex];
        weatherInfo += `${hour.toString().padStart(2, "0")}:00 - ${temp}°C, ${cond}, ${precipProb}% rain\n`;
      }
    }

    // Add daily forecast (next 5 days)
    if (weatherData.daily) {
      weatherInfo += "\n**Daily Forecast (Next 5 Days):**\n";
      const days = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5"];
      for (let i = 0; i < 5; i++) {
        const maxTemp = Math.round(weatherData.daily.temperature_2m_max[i]);
        const minTemp = Math.round(weatherData.daily.temperature_2m_min[i]);
        const cond = getCondition(weatherData.daily.weather_code[i]);
        const precipSum = weatherData.daily.precipitation_sum[i];
        const precipProb = weatherData.daily.precipitation_probability_max[i];
        weatherInfo += `${days[i]}: ${minTemp}°C - ${maxTemp}°C, ${cond}, ${precipSum}mm rain (${precipProb}% chance)\n`;
      }
    }

    return {
      status: true,
      content: weatherInfo,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        status: false,
        content: "Request timed out. Please try again.",
      };
    }
    return {
      status: false,
      content:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching weather data.",
    };
  }
};

export default Weather;
