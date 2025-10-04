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
        location
      )}&count=1&language=en&format=json`,
      { signal: geoController.signal }
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
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh`,
      { signal: weatherController.signal }
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

    const weatherInfo = [
      `Location: ${name}, ${country}`,
      `Temperature: ${Math.round(current.temperature_2m)}°C`,
      `Condition: ${condition}`,
      `Humidity: ${current.relative_humidity_2m}%`,
      `Wind Speed: ${Math.round(current.wind_speed_10m)} km/h`,
    ].join("\n");

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
