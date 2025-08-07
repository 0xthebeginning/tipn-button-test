'use client';

import { useRef, useState } from 'react';
import StickerOverlay, { StickerOverlayHandle } from './StickerOverlay';

export default function EditorPageClient() {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const stickerRef = useRef<StickerOverlayHandle>(null);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoURL(url);
    }
  }

  return (
    <main className="min-h-screen bg-[#f1fff0] dark:bg-gray-900 flex items-center justify-center transition-colors">
      <div className="m-4 p-6 bg-white dark:bg-gray-800 border-2 border-[#52a842] dark:border-[#4ccc84] rounded-2xl shadow-lg space-y-6 text-center w-full max-w-md transition-colors">
        
        {/* 🟣 About Section */}
        <div className="p-4 rounded-xl bg-purple-100 dark:bg-purple-900 text-center">
          <h2 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-1">
            About SuperInu Moments
          </h2>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Meme your moment with $SuperInu! Upload a photo, add a sticker, and instantly cast it to your Farcaster feed. Built by @terricola.eth with the Farcaster Mini App SDK.
          </p>
        </div>

        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#52a842] to-[#4ccc84] text-transparent bg-clip-text dark:from-[#bbf7d0] dark:to-[#86efac]">
          🐶 Meme Your SuperInu Moment
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          Upload or snap a photo to start creating your personalized cast!
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="w-full text-sm text-gray-700 dark:text-gray-200 file:bg-[#52a842] file:hover:bg-[#3e8d35] file:text-white file:rounded-lg file:px-4 file:py-2 file:border-none transition-colors"
        />

        {photoURL && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">PREVIEW WITH STICKER</p>

            <StickerOverlay
              ref={stickerRef}
              photoUrl={photoURL}
              stickerUrl="/superinuMain.png"
            />

            <button
              onClick={() => stickerRef.current?.shareImage()}
              className="w-full py-3 bg-[#52a842] hover:bg-[#3e8d35] text-white text-lg rounded-xl transition"
            >
              Share to Feed
            </button>
          </div>
        )}
      </div>
    </main>
  );
}