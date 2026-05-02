'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import WeatherCard from '@/components/WeatherCard';
import ForecastCard from '@/components/ForecastCard';
import SearchBar from '@/components/SearchBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import StreamingIndicator from '@/components/StreamingIndicator';

const FLASK_URL = '';  // Use relative path for same-origin requests
const EXPECTED_DAYS = 5;

type StreamStatus = 'idle' | 'streaming' | 'complete' | 'error';

type WeatherData = {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  wind: number;
  pressure: number;
  icon: string;
  sunrise?: number;
  sunset?: number;
};

type ForecastDay = {
  date: string;
  temp_min: number;
  temp_max: number;
  temp_avg: number;
  description: string;
  icon: string;
};

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [issueDate, setIssueDate] = useState('');

  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Only compute on the client to avoid SSR/CSR hydration mismatch on the date
    const d = new Date();
    setIssueDate(
      `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
    );
  }, []);

  const closeStream = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
  }, []);

  const fetchData = useCallback(async (city: string, country: string) => {
    // Close any in-flight stream before starting a new one
    closeStream();
    setError(null);
    setWeather(null);
    setForecast([]);
    setWeatherLoading(true);
    setStreamStatus('streaming');

    // Current weather — still unary; hit Next.js route which proxies to Flask.
    try {
      const res = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch weather');
      setWeather(json);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setStreamStatus('error');
      setWeatherLoading(false);
      return;
    } finally {
      setWeatherLoading(false);
    }

    // Forecast — server-streaming gRPC surfaced as SSE from the Flask gateway via Next.js proxy.
    const url =
      `/api/forecast?city=${encodeURIComponent(city)}` +
      `&country=${encodeURIComponent(country)}&days=${EXPECTED_DAYS}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('message', (ev) => {
      try {
        const day: ForecastDay = JSON.parse(ev.data);
        setForecast((prev) => [...prev, day]);
      } catch {
        /* ignore malformed frames */
      }
    });

    es.addEventListener('done', () => {
      setStreamStatus('complete');
      closeStream();
    });

    es.addEventListener('error', (ev: MessageEvent) => {
      // Some errors arrive as named `error` events with data; others are native.
      const data = (ev as any).data;
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          setError(parsed.error || 'Forecast stream failed');
        } catch {
          setError('Forecast stream failed');
        }
      } else {
        setError('Forecast connection dropped');
      }
      setStreamStatus('error');
      closeStream();
    });
  }, [closeStream]);

  useEffect(() => {
    return closeStream;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showForecastSection =
    streamStatus !== 'idle' && (forecast.length > 0 || streamStatus === 'streaming');

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* MASTHEAD */}
        <header className="flex items-baseline justify-between border-b-2 border-ink pb-3 mb-8">
          <h1 className="font-serif italic font-black text-2xl md:text-3xl tracking-tight">
            THE WEATHER
          </h1>
          <div className="brut-label text-right">
            <div>ISSUE № 001</div>
            <div className="opacity-70" suppressHydrationWarning>{issueDate || ' '}</div>
          </div>
        </header>

        {/* SEARCH */}
        <SearchBar onSearch={fetchData} disabled={weatherLoading} />

        {/* ERROR */}
        {error && <ErrorMessage message={error} />}

        {/* HERO — current weather */}
        {weatherLoading && (
          <div className="brut-card-sm p-6 mt-2">
            <p className="brut-label">Fetching current conditions…</p>
          </div>
        )}
        {weather && <WeatherCard data={weather} />}

        {/* FORECAST — streams in */}
        {showForecastSection && (
          <section className="mt-10">
            <div className="flex items-end justify-between mb-4 border-b-2 border-ink/80 pb-2">
              <h2 className="font-serif italic font-black text-lg md:text-xl">5-DAY FORECAST</h2>
              <StreamingIndicator
                status={streamStatus}
                count={forecast.length}
                total={EXPECTED_DAYS}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {forecast.map((day, i) => (
                <ForecastCard key={day.date} data={day} index={i} />
              ))}
              {/* placeholder frames for days not yet streamed in */}
              {streamStatus === 'streaming' &&
                Array.from({ length: Math.max(0, EXPECTED_DAYS - forecast.length) }).map((_, i) => (
                  <div
                    key={`ph-${i}`}
                    className="border-2 border-dashed border-ink/30 h-32 bg-paperLight/40"
                    aria-hidden
                  />
                ))}
            </div>
          </section>
        )}

        {/* Empty state — only seen before first fetch (vanishingly rare now that we auto-fetch) */}
        {!weather && !weatherLoading && !error && streamStatus === 'idle' && (
          <div className="mt-8">
            <LoadingSpinner />
          </div>
        )}

        {/* FOOTER — tiny colophon */}
        <footer className="mt-16 pt-4 border-t-2 border-ink/80 flex items-center justify-between brut-label opacity-70">
          <span>SET IN PLAYFAIR &amp; INTER</span>
          <span>gRPC · OPENWEATHERMAP</span>
        </footer>
      </div>
    </main>
  );
}
