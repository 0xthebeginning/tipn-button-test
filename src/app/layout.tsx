// src/app/layout.tsx
import "~/app/globals.css";
import type { Metadata } from "next";
import { useEffect, useState } from "react";
import ClientWrapper from "./client-wrapper";
import { getMiniAppEmbedMetadata } from "~/lib/utils";

export const metadata: Metadata = {
  title: "SuperInu",
  description: "Create and share custom SuperInu memes!",
  openGraph: {
    title: "SuperInu",
    description: "Create and share custom SuperInu memes!",
    url: "https://superinu-miniapp.vercel.app",
    images: [
      {
        url: "https://superinu-miniapp.vercel.app/splash.png",
        width: 1200,
        height: 630,
        alt: "SuperInu Meme Preview",
      },
    ],
  },
  other: {
    "fc:miniapp": JSON.stringify(getMiniAppEmbedMetadata()),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
    <html lang="en">
      <body className="transition-colors duration-300 bg-white text-black dark:bg-black dark:text-white">
        <div className="p-4 flex justify-end">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:opacity-80"
          >
            {darkMode ? "🌞 Light" : "🌙 Dark"}
          </button>
        </div>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}