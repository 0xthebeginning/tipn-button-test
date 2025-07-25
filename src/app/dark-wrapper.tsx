'use client';

import { useEffect, useState } from "react";

export default function DarkModeWrapper({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    setDarkMode(stored === "true");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  return (
    <div className="transition-colors duration-300 bg-white text-black dark:bg-black dark:text-white min-h-screen">
      <div className="p-4 flex justify-end">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:opacity-80"
        >
          {darkMode ? "🌞 Light" : "🌙 Dark"}
        </button>
      </div>
      {children}
    </div>
  );
}