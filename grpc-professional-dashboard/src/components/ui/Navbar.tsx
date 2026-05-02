"use client";

import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="header bg-white dark:bg-gray-800 shadow-sm">
      <div className="container flex justify-between items-center">
        <div className="text-2xl font-bold text-primary-600">WeatherGRPC</div>
        <nav className="flex items-center space-x-6">
          <button
            onClick={toggleTheme}
            className="btn p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </nav>
      </div>
    </header>
  );
}