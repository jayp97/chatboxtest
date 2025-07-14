/**
 * WeatherArt.tsx
 * Weather-responsive ASCII art component
 * Shows dynamic ASCII based on weather conditions
 */

export function WeatherArt({ condition }: { condition: string }) {
  return (
    <div className="weather-art">
      {/* Weather ASCII art will be implemented here */}
      <pre>Weather: {condition}</pre>
    </div>
  );
}