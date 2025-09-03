// src/components/EditorPageClient.tsx
'use client';

import { useRef, useState } from 'react';
import StickerOverlay, { StickerOverlayHandle } from './StickerOverlay';
import sdk from '@farcaster/miniapp-sdk';
import YourStats from './YourStats';

type TabKey = 'editor' | 'stats' | 'about';

export default function EditorPageClient() {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('editor');
  const stickerRef = useRef<StickerOverlayHandle>(null);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoURL(URL.createObjectURL(file));
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
      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        {(['editor', 'stats', 'about'] as TabKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === key
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:opacity-90'
            }`}
          >
            {key === 'editor' ? 'Editor' : key === 'stats' ? 'Your Stats' : 'About'}
          </button>
        ))}
      </div>

      {/* Editor tab */}
      {activeTab === 'editor' && (
        <div className="m-4 p-6 bg-white dark:bg-gray-800 border-2 border-[#52a842] dark:border-[#4ccc84] rounded-2xl shadow-lg space-y-6 text-center w-full max-w-md transition-colors">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#52a842] to-[#4ccc84] text-transparent bg-clip-text dark:from-[#bbf7d0] dark:to-[#86efac]">
            🐶 Meme Your SuperInu Moment
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Upload or snap a photo to start creating your personalized SuperInu image!
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

      {/* Your Stats tab */}
      {activeTab === 'stats' && (
        <div className="w-full max-w-md">
          <YourStats />
        </div>
      )}

      {/* About tab */}
      {activeTab === 'about' && (
        <div className="m-4 p-6 bg-white dark:bg-gray-800 border-2 border-[#52a842] dark:border-[#4ccc84] rounded-2xl shadow-lg space-y-4 w-full max-w-md transition-colors">
          <div className="p-4 rounded-xl bg-purple-100 dark:bg-purple-900 text-center">
            <h2 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-2">
              About SuperInu
            </h2>
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
              $SuperInu is a fun memecoin launched on streme.fun!<br />
              You can stake it to earn more + $SUP.
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg"
              >
                Stake Now
              </button>
            </div>
          </div>

          <div className="text-left text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <p><span className="font-semibold">Token:</span> 0x063eDA1b84ceaF79b8cC4a41658b449e8E1F9Eeb (Base)</p>
            <p><span className="font-semibold">Staked Token:</span> 0xC7F2329977339F4Ae003373D1ACb9717F9d0c6D5</p>
            <p><span className="font-semibold">Miniapp:</span> farcaster.xyz/miniapps/8CEpD-h8a_uW/superinu</p>
          </div>
        </div>
      )}
    </main>
  );
}