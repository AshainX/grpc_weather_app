/**
 * Maps a weather description (from OpenWeatherMap's `weather[0].description` or `main`)
 * to the accent color it should drive across the UI.
 *
 * We don't have access to `weather[0].main` through the current gRPC contract
 * (only the description string), so we classify from that text.
 */
export function accentFor(description: string | undefined): string {
  if (!description) return '#d97f2b'; // ochre default
  const d = description.toLowerCase();

  if (d.includes('thunder') || d.includes('storm')) return '#2f7d8a'; // teal
  if (d.includes('drizzle') || d.includes('rain') || d.includes('shower')) return '#2f7d8a';
  if (d.includes('snow') || d.includes('sleet') || d.includes('blizzard')) return '#8fb4c7'; // ice
  if (d.includes('mist') || d.includes('fog') || d.includes('haze') || d.includes('smoke') || d.includes('dust')) return '#b89c6f'; // sand
  if (d.includes('cloud') || d.includes('overcast')) return '#9b9484'; // slate
  if (d.includes('clear') || d.includes('sun')) return '#e8a02a'; // amber

  return '#d97f2b';
}
