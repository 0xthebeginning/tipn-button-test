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
    <main className="min-h-screen bg-[#f1fff0] flex items-center justify-center">
      {showTipping ? (
        <SampleDisplay />
      ) : (
        <div className="m-4 p-6 bg-white border-2 border-[#52a842] rounded-2xl shadow-lg space-y-6 text-center w-full max-w-md">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#52a842] to-[#4ccc84] text-transparent bg-clip-text">
            🐶 Meme Your SuperInu Moment
          </h1>
          <p className="text-gray-700">
            Upload or snap a photo to start creating your personalized cast!
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="w-full text-sm text-gray-700 file:bg-[#52a842] file:hover:bg-[#3e8d35] file:text-white file:rounded-lg file:px-4 file:py-2 file:border-none"
          />

          {photoURL && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">PREVIEW WITH STICKER</p>

              <StickerOverlay
                ref={stickerRef}
                photoUrl={photoURL}
                stickerUrl="/superinuMain.png"
              />

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => stickerRef.current?.shareImage()}
                  className="flex-1 py-2 bg-[#52a842] text-white rounded-lg hover:bg-[#3e8d35] transition"
                >
                  Share
                </button>
              </div>

              <button
                onClick={() => setShowTipping(true)}
                className="mt-4 w-full py-3 bg-[#52a842] text-white text-lg rounded-xl hover:bg-[#3e8d35] transition"
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
