'use client';
import { useRef, useState } from "react";
import SampleDisplay from "../components/SampleDisplay";
import StickerOverlay, { StickerOverlayHandle } from '../components/StickerOverlay';

export default function Page() {
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
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      {showTipping ? (
        <SampleDisplay />
      ) : (
        <div className="m-4 p-6 bg-white border rounded-2xl shadow space-y-6 text-center w-full max-w-md">
          <h1 className="text-2xl font-bold text-purple-800">📸 Share a Meme Moment</h1>
          <p className="text-gray-600">
            Upload or take a photo to start creating your custom cast!
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="w-full text-sm text-gray-600 file:bg-purple-600 file:text-white file:rounded-lg file:px-4 file:py-2 file:border-none"
          />

          {photoURL && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Preview with Sticker:</p>

              <StickerOverlay
                ref={stickerRef}
                photoUrl={photoURL}
                stickerUrl="/superinuMain.png"
              />

              <div className="flex gap-4">
                <button
                  onClick={() => stickerRef.current?.downloadImage()}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Download
                </button>
                <button
                  onClick={() => stickerRef.current?.shareImage()}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Share
                </button>
              </div>


              <button
                onClick={() => setShowTipping(true)}
                className="mt-4 w-full py-3 bg-purple-600 text-white text-lg rounded-xl hover:bg-purple-700 transition"
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