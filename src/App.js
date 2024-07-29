import React, { useState, useEffect } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Droplets,
  Thermometer,
  Search,
} from "lucide-react";
import { FaGithub, FaStar } from "react-icons/fa";
import { Button } from "./components/ui/button";

const API_KEY = "a6039d6d2b4683c557209b24b517a088"; // Replace this with your actual API key when implementing
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const GEO_API_URL = "https://api.openweathermap.org/geo/1.0/direct";

const getBackgroundColor = (weatherId) => {
  if (weatherId >= 200 && weatherId < 300) return "bg-gray-700"; // Thunderstorm
  if (weatherId >= 300 && weatherId < 500) return "bg-blue-300"; // Drizzle
  if (weatherId >= 500 && weatherId < 600) return "bg-blue-500"; // Rain
  if (weatherId >= 600 && weatherId < 700) return "bg-blue-100"; // Snow
  if (weatherId >= 700 && weatherId < 800) return "bg-yellow-100"; // Atmosphere
  if (weatherId === 800) return "bg-blue-400"; // Clear
  if (weatherId > 800) return "bg-gray-300"; // Clouds
  return "bg-gray-200"; // Default
};

const WeatherIcon = ({ weatherId }) => {
  if (weatherId >= 200 && weatherId < 300)
    return <CloudRain className="text-gray-600" size={48} />; // Thunderstorm
  if (weatherId >= 300 && weatherId < 500)
    return <CloudRain className="text-blue-400" size={48} />; // Drizzle
  if (weatherId >= 500 && weatherId < 600)
    return <CloudRain className="text-blue-600" size={48} />; // Rain
  if (weatherId >= 600 && weatherId < 700)
    return <Snowflake className="text-white" size={48} />; // Snow
  if (weatherId >= 700 && weatherId < 800)
    return <Cloud className="text-gray-400" size={48} />; // Atmosphere
  if (weatherId === 800) return <Sun className="text-yellow-400" size={48} />; // Clear
  if (weatherId > 800) return <Cloud className="text-gray-600" size={48} />; // Clouds
  return null;
};

const App = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) {
        throw new Error("Weather data not found");
      }
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (input) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `${GEO_API_URL}?q=${input}&limit=5&appid=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setQuery(input);
    fetchSuggestions(input);
  };

  const handleSuggestionClick = (lat, lon) => {
    setQuery("");
    setSuggestions([]);
    fetchWeather(lat, lon);
  };

  useEffect(() => {
    // Fetch weather for a default city on initial load
    fetchWeather(51.5074, -0.1278); // London coordinates
  }, []);

  const bgColor = weather
    ? getBackgroundColor(weather.weather[0].id)
    : "bg-gray-200";

  return (
    <div
      className={`min-h-screen ${bgColor} flex flex-col items-center justify-center p-4 transition-colors duration-500`}
    >
      <div className="w-full max-w-md mb-8">
        <div className="relative">
          <input
            className="w-full px-4 py-2 text-gray-700 bg-white border rounded-full focus:outline-none focus:border-blue-500"
            type="text"
            placeholder="Enter city name"
            value={query}
            onChange={handleInputChange}
          />
          <button
            className="absolute right-0 top-0 mt-2 mr-4 text-blue-500"
            onClick={() => fetchSuggestions(query)}
          >
            <Search size={24} />
          </button>
        </div>
        {suggestions.length > 0 && (
          <ul className="mt-2 bg-white border rounded-md shadow-lg">
            {suggestions.map((city, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(city.lat, city.lon)}
              >
                {city.name}, {city.state ? `${city.state}, ` : ""}
                {city.country}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <div className="text-white">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {weather && (
        <div className="bg-white bg-opacity-80 rounded-lg shadow-lg p-6 max-w-sm w-full">
          <h1 className="text-3xl font-bold mb-4">
            {weather.name}, {weather.sys.country}
          </h1>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-5xl font-semibold">
                {Math.round(weather.main.temp)}°C
              </p>
              <p className="text-xl capitalize">
                {weather.weather[0].description}
              </p>
            </div>
            <WeatherIcon weatherId={weather.weather[0].id} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <Thermometer className="mr-2" />
              <div>
                <p className="font-semibold">Feels Like</p>
                <p>{Math.round(weather.main.feels_like)}°C</p>
              </div>
            </div>
            <div className="flex items-center">
              <Droplets className="mr-2" />
              <div>
                <p className="font-semibold">Humidity</p>
                <p>{weather.main.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center">
              <Wind className="mr-2" />
              <div>
                <p className="font-semibold">Wind</p>
                <p>{Math.round(weather.wind.speed * 3.6)} km/h</p>
              </div>
            </div>
            <div className="flex items-center">
              <Cloud className="mr-2" />
              <div>
                <p className="font-semibold">Cloudiness</p>
                <p>{weather.clouds.all}%</p>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Button
              className="mb-2"
              onClick={() =>
                window.open("https://github.com/SAIKUMAR039", "_blank")
              }
            >
              <FaStar className="mr-2 h-4 w-4 text-yellow-400" />
              Star on GitHub
            </Button>
            <br />
            <a
              href="https://github.com/SAIKUMAR039"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:text-blue-500"
            >
              <FaGithub size={27} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
