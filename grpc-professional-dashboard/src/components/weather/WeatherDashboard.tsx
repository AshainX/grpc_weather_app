"use client";

import { FiAlertCircle, FiWind, FiDroplet, FiThermometer } from "react-icons/fi";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import { useCallback, useEffect, useRef, useState } from "react";

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface ForecastDay {
  date: string;
  temp_min: number;
  temp_max: number;
  temp_avg: number;
  description: string;
  icon: string;
}

interface ForecastData {
  day: string;
  temperature: number;
  condition: string;
  icon: string;
}

const WeatherCard = ({ data }: { data: WeatherData }) => (
  <motion.div
    className="card animate-fadeIn"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="flex-shrink-0">
        <img
          src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
          alt={data.condition}
          className="w-24 h-24 object-contain"
        />
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-2">{data.city}</h2>
        <div className="text-4xl font-bold mb-2">
          {data.temperature}°<span className="text-lg">C</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4 capitalize">{data.condition}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <FiThermometer className="text-primary-600" />
            <span>Feels like {data.temperature - 2}°C</span>
          </div>
          <div className="flex items-center gap-2">
            <FiDroplet className="text-primary-600" />
            <span>Humidity: {data.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <FiWind className="text-primary-600" />
            <span>Wind: {data.windSpeed} km/h</span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const ForecastCard = ({ data }: { data: ForecastData }) => {
  const dayName = new Date(data.day).toLocaleDateString("en-US", { weekday: "short" });
  return (
    <motion.div
      className="card animate-fadeIn"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm font-medium">{dayName}</div>
        <img
          src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
          alt={data.condition}
          className="w-12 h-12 object-contain"
        />
        <div className="text-lg font-bold">{Math.round(data.temperature)}°C</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">{data.condition}</div>
      </div>
    </motion.div>
  );
};

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const initialLoaded = useRef(false);

  const closeStream = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
  }, []);

  useEffect(() => {
    return closeStream;
  }, [closeStream]);

  useEffect(() => {
    if (initialLoaded.current) return;
    initialLoaded.current = true;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/weather?city=New%20Delhi&country=IN");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch weather");
        setWeatherData({
          city: json.city,
          temperature: Math.round(json.temp),
          condition: json.description,
          humidity: json.humidity,
          windSpeed: Math.round((json.wind || 0) * 3.6),
          icon: json.icon,
        });

        const es = new EventSource("/api/forecast?city=New%20Delhi&country=IN&days=5");
        esRef.current = es;
        es.addEventListener("message", (ev) => {
          try {
            const day: ForecastDay = JSON.parse(ev.data);
            setForecast((prev) => [...prev, day]);
          } catch {}
        });
        es.addEventListener("done", () => {
          setLoading(false);
          closeStream();
        });
        es.addEventListener("error", () => {
          setLoading(false);
          closeStream();
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = useCallback(async (city: string, country: string) => {
    closeStream();
    setError(null);
    setWeatherData(null);
    setForecast([]);
    setLoading(true);

    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch weather");
      setWeatherData({
        city: json.city,
        temperature: Math.round(json.temp),
        condition: json.description,
        humidity: json.humidity,
        windSpeed: Math.round((json.wind || 0) * 3.6),
        icon: json.icon,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }

    const url = `/api/forecast?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&days=5`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("message", (ev) => {
      try {
        const day: ForecastDay = JSON.parse(ev.data);
        setForecast((prev) => [...prev, day]);
      } catch {
        // ignore
      }
    });

    es.addEventListener("done", () => {
      closeStream();
    });

    es.addEventListener("error", () => {
      setError("Forecast connection dropped");
      closeStream();
    });
  }, [closeStream]);

  const defaultForecast: ForecastData[] = [
    { day: "2026-05-03", temperature: 0, condition: "Loading...", icon: "01d" },
    { day: "2026-05-04", temperature: 0, condition: "Loading...", icon: "03d" },
    { day: "2026-05-05", temperature: 0, condition: "Loading...", icon: "10d" },
    { day: "2026-05-06", temperature: 0, condition: "Loading...", icon: "01d" },
    { day: "2026-05-07", temperature: 0, condition: "Loading...", icon: "02d" },
  ];

  const displayForecast: ForecastData[] = forecast.length > 0
    ? forecast.map((f) => ({
        day: f.date,
        temperature: f.temp_avg,
        condition: f.description,
        icon: f.icon,
      }))
    : defaultForecast;

  return (
    <div className="space-y-8">
      <SearchBar onSearch={handleSearch} disabled={loading} />
      {error && (
        <div className="flex items-center gap-2 text-red-500">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {loading && !weatherData ? (
            <div className="card flex items-center justify-center h-48">
              <span className="text-gray-500">Loading weather...</span>
            </div>
          ) : weatherData ? (
            <WeatherCard data={weatherData} />
          ) : null}
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-bold">5-Day Forecast</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {displayForecast.map((day, index) => (
              <ForecastCard key={day.day || index} data={day} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}