import { accentFor } from '@/lib/accents';

interface WeatherCardProps {
  data: {
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
}

function fmtTime(unix?: number) {
  if (!unix) return '—';
  const d = new Date(unix * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function WeatherCard({ data }: WeatherCardProps) {
  const accent = accentFor(data.description);

  return (
    <article className="brut-card p-7 md:p-9">
      {/* accent dot, top-right */}
      <span
        aria-hidden
        className="absolute top-4 right-4 w-10 h-10 rounded-full"
        style={{ backgroundColor: accent }}
      />

      <p className="font-serif italic text-base md:text-lg">
        {data.city}, {data.country}
      </p>
      <div className="brut-rule mt-1" style={{ backgroundColor: accent }} />

      <div className="mt-5 flex items-end gap-5 md:gap-8">
        <div className="flex-shrink-0">
          <img
            src={`https://openweathermap.org/img/wn/${data.icon}@4x.png`}
            alt=""
            className="w-24 h-24 md:w-28 md:h-28 ink-icon"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-serif font-black leading-none tracking-tight text-[96px] md:text-[128px]">
            {Math.round(data.temp)}°
          </div>
          <div className="brut-label mt-1">{data.description}</div>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-1.5">
        <span className="brut-pill">HUMID <b className="ml-1 font-black">{data.humidity}</b></span>
        <span className="brut-pill">WIND <b className="ml-1 font-black">{data.wind} M/S</b></span>
        <span className="brut-pill">FEELS <b className="ml-1 font-black">{Math.round(data.feels_like)}°</b></span>
        <span className="brut-pill">PRES <b className="ml-1 font-black">{data.pressure}</b></span>
      </div>

      {(data.sunrise || data.sunset) && (
        <div className="mt-5 pt-4 border-t-2 border-ink/80 flex justify-between brut-label">
          <span>SUNRISE · {fmtTime(data.sunrise)}</span>
          <span>SUNSET · {fmtTime(data.sunset)}</span>
        </div>
      )}
    </article>
  );
}
