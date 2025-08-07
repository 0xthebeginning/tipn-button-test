'use client';

import { useRef, useState } from 'react';
import StickerOverlay, { StickerOverlayHandle } from './StickerOverlay';
import sdk from '@farcaster/miniapp-sdk';
import YourStats from './YourStats'; 

export default function EditorPageClient() {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'stats'>('editor');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const stickerRef = useRef<StickerOverlayHandle>(null);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoURL(url);
    }
  }

  async function handleBuy() {
    try {
      await sdk.actions.swapToken({
        buyToken: 'eip155:8453/erc20:0x063eDA1b84ceaF79b8cC4a41658b449e8E1F9Eeb',
      });
    } catch (err) {
      console.error('Swap failed or was cancelled:', err);
    }
  }

  async function handleStake() {
    try {
      await sdk.actions.openMiniApp({
        url: 'https://farcaster.xyz/miniapps/tmjNyAmp7nkC/streme',
      });
    } catch (err) {
      console.error('Open MiniApp failed:', err);
    }
  }

  return (
    <main className="min-h-screen bg-[#f1fff0] dark:bg-gray-900 flex flex-col items-center justify-start pt-6 transition-colors">

      {/* 🟢 Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === 'editor' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === 'stats' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
          }`}
        >
          Your Stats
        </button>
      </div>

      {activeTab === 'stats' ? (
        <YourStats />
      ) : (
        <div className="m-4 p-6 bg-white dark:bg-gray-800 border-2 border-[#52a842] dark:border-[#4ccc84] rounded-2xl shadow-lg space-y-6 text-center w-full max-w-md transition-colors">
          
          {/* 🟣 Expandable About Section */}
          <div className="p-4 rounded-xl bg-purple-100 dark:bg-purple-900 text-center">
            <button
              onClick={() => setIsAboutOpen(!isAboutOpen)}
              className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-1 focus:outline-none"
            >
              About SuperInu {isAboutOpen ? '▲' : '▼'}
            </button>

            {isAboutOpen && (
              <>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-2 mb-4">
                  $SuperInu is a fun memecoin launched on streme.fun!<br />
                  You can stake it to earn more + $SUP
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleBuy}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={handleStake}
                    className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1 rounded-lg text-sm"
                  >
                    Stake Now
                  </button>
                </div>
              </>
            )}
          </div>

          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#52a842] to-[#4ccc84] text-transparent bg-clip-text dark:from-[#bbf7d0] dark:to-[#86efac]">
            🐶 Meme Your SuperInu Moment
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Upload or snap a photo to start creating your personalized SuperInu image!<br />
            You will be able to share it to your friends once you are ready!
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
                stickerUrl="/superinuMain2.png"
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
      )}
    </main>
  );
}