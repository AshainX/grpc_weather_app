'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string, country: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) onSearch(city.trim(), country.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 mb-10">
      <input
        type="text"
        placeholder="Enter a city — London, Tokyo, Reykjavík…"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        disabled={disabled}
        className="brut-input flex-1 min-w-0"
      />
      <input
        type="text"
        placeholder="GB"
        value={country}
        onChange={(e) => setCountry(e.target.value.toUpperCase())}
        maxLength={2}
        disabled={disabled}
        className="brut-input w-full md:w-28 text-center not-italic uppercase tracking-[0.2em] font-sans font-extrabold"
      />
      <button type="submit" disabled={disabled} className="brut-btn disabled:opacity-50">
        {disabled ? 'Fetching…' : 'Fetch'}
      </button>
    </form>
  );
}
