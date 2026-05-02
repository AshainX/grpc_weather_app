"use client";

import { FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (city: string, country: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled }: SearchBarProps) {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("US");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    onSearch(city.trim(), country.trim());
  };

  return (
    <motion.div
      className="card mb-8 animate-fadeIn"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <FiSearch className="text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          placeholder="Search for a city..."
          className="flex-1 outline-none bg-transparent text-lg focus:ring-2 focus:ring-primary-500"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={disabled}
        />
        <input
          type="text"
          placeholder="Country (e.g., US)"
          className="w-20 outline-none bg-transparent text-lg focus:ring-2 focus:ring-primary-500"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          maxLength={2}
          disabled={disabled}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
          disabled={disabled || !city.trim()}
        >
          Search
        </button>
      </form>
    </motion.div>
  );
}