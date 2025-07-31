import { GetWeather } from "./functions/weather";
import WikipediaSummary from "./functions/wikipedia";

export const availableFunctions = {
  weather: GetWeather,
  wikipediaSummary: WikipediaSummary,
};
