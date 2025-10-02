'use client';

import { useRef, useState, useMemo } from 'react';
import StickerOverlay, { StickerOverlayHandle } from './StickerOverlay';
import sdk from '@farcaster/miniapp-sdk';
import YourStats, { useSuperInuStatus } from './YourStats';
import { useAppKitAccount } from '@reown/appkit/react';

import WalletStandardDebug from './WalletStandardDebug';

type TabKey = 'editor' | 'stats' | 'about';

function isAddr(x: string): x is `0x${string}` {
  return typeof x === 'string' && /^0x[a-f0-9]{40}$/i.test(x);
}

export default function EditorPageClient() {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('editor');
  const [stickerMode, setStickerMode] = useState<'regular' | 'staker'>('regular');
  const stickerRef = useRef<StickerOverlayHandle>(null);

  // 🔌 Connected wallet via AppKit (WalletConnect)
  const { address } = useAppKitAccount();
  const extraAddresses = useMemo(
    () => (isAddr(address ?? '') ? [address!.toLowerCase()] : []),
    [address]
  );

  // ✅ Use the hook with optional connected address
  const status = useSuperInuStatus({ extraAddresses });

  const score = (status.isHolder ? 1 : 0) + (status.isStaker ? 1 : 0);
  const statusLabel = status.isHolder
    ? status.isStaker
      ? 'Holder + Staker'
      : 'Holder'
    : 'Not Holder';

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setPhotoURL(URL.createObjectURL(f));
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

  // choose sticker art by mode
  const stickerUrl =
    stickerMode === 'staker' ? '/superinuStaker.png' : '/superinuMain2.png';

  const canUseStickers = status.isHolder; // gate editor by holding
  const canUseStakerSticker = status.isStaker;

  return (
    <main className="min-h-screen bg-transparent flex flex-col items-center justify-start pt-6 transition-colors">
      {/* Top tabs */}
      <div className="flex gap-4 mb-2">
        {(['editor', 'stats', 'about'] as TabKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === key
                ? 'bg-green-600 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {key === 'editor' ? 'Editor' : key === 'stats' ? 'Your Stats' : 'About'}
          </button>
        ))}
      </div>

      {/* Shared mini status banner */}
      <div className="mb-4 text-sm text-white/90">
        Status: <span className="font-semibold">{score}/2</span>&nbsp;
        <span className="opacity-80">({statusLabel})</span>
      </div>

      {/* Tabs */}
      {activeTab === 'stats' && (
        <div className="w-full max-w-md">
          {/* No props needed here */}
          <YourStats />
        </div>
      )}

      {activeTab === 'about' && (
        <div className="m-4 p-6 bg-white/5 border border-green-700/50 rounded-2xl shadow-lg space-y-4 w-full max-w-md">
          <h2 className="text-xl font-bold">About SuperInu</h2>
          <p className="text-sm opacity-90">
            $SuperInu is a fun memecoin launched on streme.fun! You can stake it to earn more + $SUP.
          </p>
          <div className="flex gap-3">
            <button onClick={handleBuy} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700">
              Buy Now
            </button>
            <button onClick={handleStake} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700">
              Stake Now
            </button>
          </div>
        </div>
      )}

      {activeTab === 'editor' && (
        <div className="m-4 p-6 bg-white/5 border border-green-700/50 rounded-2xl shadow-lg space-y-6 text-center w-full max-w-md">
          <h1 className="text-2xl font-extrabold text-green-300">💭 Meme Your SuperInu Moment</h1>
          <p className="opacity-90">Upload or snap a photo to start creating your personalized SuperInu image!</p>

          {/* Sticker mode selector */}
          <div className="flex items-center justify-center gap-3">
            <button
              className={`px-4 py-2 rounded-lg ${stickerMode === 'regular' ? 'bg-green-600' : 'bg-white/10'}`}
              onClick={() => setStickerMode('regular')}
            >
              Regular
            </button>
            <button
              disabled={!canUseStakerSticker}
              title={!canUseStakerSticker ? 'Stake to unlock' : ''}
              className={`px-4 py-2 rounded-lg ${stickerMode === 'staker' ? 'bg-green-600' : 'bg-white/10'} ${
                !canUseStakerSticker ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => canUseStakerSticker && setStickerMode('staker')}
            >
              Staker
            </button>
          </div>

          {/* Wallet debug output - for testing Seeker/Backpack detection */}
          <div className="mt-4 w-full max-w-md">
            <WalletStandardDebug />
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="w-full text-sm file:bg-green-600 file:text-white file:rounded-lg file:px-4 file:py-2 file:border-none"
          />

          {/* Holder gate */}
          {!canUseStickers && (
            <div className="mt-4 rounded-xl border border-yellow-400/40 bg-yellow-500/10 p-4">
              <p className="font-semibold text-yellow-300">
                You need to hold <span className="font-black">$SUPERINU</span> in at least one wallet to use stickers.
              </p>
              <div className="mt-3">
                <button onClick={handleBuy} className="px-5 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700">
                  Buy Now
                </button>
              </div>
            </div>
          )}

          {photoURL && canUseStickers && (
            <div className="mt-4 space-y-4">
              <p className="text-sm opacity-80">Preview</p>
              <StickerOverlay ref={stickerRef} photoUrl={photoURL} stickerUrl={stickerUrl} />
              <button
                onClick={() => stickerRef.current?.shareImage()}
                className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl"
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