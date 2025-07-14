/**
 * CountryArt.tsx
 * Country-specific ASCII art component
 * Displays animated ASCII art based on selected country
 */

export function CountryArt({ country }: { country: string }) {
  return (
    <div className="country-art">
      {/* Country-specific ASCII art will be implemented here */}
      <pre>ASCII Art for {country}</pre>
    </div>
  );
}