'use client';
import { useRef, useState } from "react";
import SampleDisplay from "./SampleDisplay";
import StickerOverlay, { StickerOverlayHandle } from './StickerOverlay';

export default function EditorPageClient() {
  const [showTipping, setShowTipping] = useState(false);
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
    <main className="min-h-screen bg-[#fefbf6] flex items-center justify-center px-4 py-10">
      {showTipping ? (
        <SampleDisplay />
      ) : (
        <div className="w-full max-w-md bg-white border border-purple-200 rounded-3xl shadow-lg p-6 space-y-6 text-center">
          <h1 className="text-3xl font-extrabold text-purple-700">🐶 Meme Your SuperInu Moment</h1>
          <p className="text-gray-600 text-sm">
            Upload or snap a photo to start creating your personalized cast!
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="w-full text-sm text-gray-600 file:bg-purple-600 file:hover:bg-purple-700 file:text-white file:rounded-full file:px-5 file:py-2 file:border-none"
          />

          {photoURL && (
            <div className="mt-4 space-y-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Preview with Sticker</p>

              <StickerOverlay
                ref={stickerRef}
                photoUrl={photoURL}
                stickerUrl="/superinuMain.png"
              />

              <div className="flex gap-4">
                <button
                  onClick={() => stickerRef.current?.shareImage()}
                  className="flex-1 py-2 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition"
                >
                  Share
                </button>
              </div>

              <button
                onClick={() => setShowTipping(true)}
                className="w-full py-3 rounded-full bg-purple-600 text-white text-lg font-semibold hover:bg-purple-700 transition"
              >
                Proceed to Tipping
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}