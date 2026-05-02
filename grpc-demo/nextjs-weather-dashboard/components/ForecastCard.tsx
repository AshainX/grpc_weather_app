import { accentFor } from '@/lib/accents';

interface ForecastCardProps {
  data: {
    date: string;
    temp_min: number;
    temp_max: number;
    temp_avg: number;
    description: string;
    icon: string;
  };
  /** 0-indexed position in the forecast row. Used to stagger the typewriter entrance. */
  index?: number;
}

const WEEKDAY_FMT = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

function parseLocalDate(s: string | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function ForecastCard({ data, index = 0 }: ForecastCardProps) {
  const accent = accentFor(data.description);
  const date = parseLocalDate(data.date);
  const weekday = date ? WEEKDAY_FMT.format(date).toUpperCase() : (data.date || '—');

  return (
    <article
      className="brut-card-sm p-3 text-center tw-in"
      style={{
        // Stagger each card's animation so the streaming cadence is visible even if
        // the server delivers them nearly simultaneously.
        animationDelay: `${index * 80}ms, ${index * 80 + 160}ms`,
      }}
    >
      <span
        aria-hidden
        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
        style={{ backgroundColor: accent }}
      />
      <div className="brut-label">{weekday}</div>
      <img
        src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
        alt=""
        className="mx-auto w-14 h-14 ink-icon"
      />
      <div className="font-serif font-black text-3xl leading-none tracking-tight">
        {Math.round(Number(data.temp_avg || 0))}°
      </div>
      <div className="mt-1.5 flex justify-between text-[9px] brut-label opacity-75">
        <span>{Math.round(Number(data.temp_min || 0))}°</span>
        <span>{Math.round(Number(data.temp_max || 0))}°</span>
      </div>
    </article>
  );
}
