# Editorial Brutalist Weather Dashboard Redesign

**Status:** approved 2026-04-23 — going to implementation
**Scope:** visual redesign of `nextjs-weather-dashboard/` + convert forecast gRPC from unary to server-streaming.

## Design pillars (locked in brainstorm)

- **Direction:** Editorial Brutalist — print-magazine feel, hard borders with offset drop-shadows, no gradients.
- **Palette:** Rust & Ochre. Paper `#e8d9c4`, paper-light `#fff8ec`, ink `#2a1b12`, shadow `#6b3a1a`.
- **Accent:** weather-reactive. Amber for Clear, slate for Clouds, teal for Rain/Drizzle/Thunderstorm, ice for Snow, sand for Mist/Fog/Haze, ochre default.
- **Typography:** Playfair Display (display serif, 900) for masthead/numerals/city; Inter (800 uppercase tracked) for labels and pills.
- **Layout:** Stacked editorial — masthead → search → hero → forecast row.
- **Motion:** Typewriter — card lands (opacity + 8px slide, ~180ms), offset shadow drops a beat later (~120ms). Staggered at 350ms across the forecast row.

## File changes

### Design system
- `tailwind.config.js` — add `paper`, `paperLight`, `ink`, `shadowInk`, `accent*` to theme colors; add `typewriter-in` + `shadow-in` keyframes.
- `app/layout.tsx` — wire Playfair Display + Inter via `next/font/google`; expose CSS vars.
- `app/globals.css` — replace gradient body with paper; add utility classes and keyframes.
- `lib/accents.ts` — new; `accentFor(condition: string): string` maps OWM `main` to hex.

### Components (all in `components/`)
- `WeatherCard.tsx` — full rewrite to hero layout.
- `ForecastCard.tsx` — full rewrite; adds `index` prop to stagger animation delay.
- `SearchBar.tsx` — restyle only.
- `LoadingSpinner.tsx` — replace with five-empty-frames placeholder + streaming indicator.
- `ErrorMessage.tsx` — restyle to bordered ink bar.
- `StreamingIndicator.tsx` — new; pulsing dot with `STREAMING` / `COMPLETE` / `IDLE` states.

### Page
- `app/page.tsx` — new masthead, issue line, streaming state via `EventSource`, hands each `ForecastDay` to a new `ForecastCard` as it arrives.
- `app/api/forecast/route.ts` — delete. Frontend hits Flask SSE directly (CORS already enabled). `app/api/weather/route.ts` stays.

### gRPC streaming
- `protos/weather.proto` — `GetForecast` returns `stream ForecastDay` (not `ForecastResponse`). `ForecastResponse` message kept for now to avoid churn but becomes unused.
- `server/weather_service.py` — `GetForecast` becomes a generator, yields one `ForecastDay` per day with `time.sleep(0.35)` between yields so streaming is visible.
- `server/api_gateway.py` — `/api/forecast` becomes an SSE endpoint; iterates the gRPC stream and emits `data: {...}\n\n` per item plus a final `event: done` frame.
- `client/weather_client.py` — updated to iterate the streaming RPC (prints days as they arrive). The user needs to rerun `protoc` after proto changes.

## Non-goals
No unit toggle, no geolocation, no dark mode, no changes to Todo service.

## Acceptance
- Page visually matches the approved mockups (palette, typography, hero layout, forecast row).
- Clicking `FETCH` streams forecast cards one at a time (visible staggered arrival).
- `STREAMING` indicator pulses during the stream and switches to `COMPLETE` when done.
- Current weather path (unary) still works unchanged.
