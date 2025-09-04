// src/components/EditorPageClient.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import StickerOverlay, { StickerOverlayHandle } from './StickerOverlay';
import sdk from '@farcaster/miniapp-sdk';
import { useMiniApp } from '@neynar/react';
import YourStats from './YourStats';

type TabKey = 'editor' | 'stats' | 'about';

type HoldingsResp = {
  token: string;
  holders: string[];
  results: { address: string; ok: boolean; balance: string; error?: string }[];
  error?: string;
};

type UserResp = {
  fid: number;
  custody_address?: string;
  verifications?: string[];
};

export default function EditorPageClient() {
  const { context } = useMiniApp();
  const fid = context?.user?.fid ?? null;

  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('editor');

  // Status state
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [holdsSuperInu, setHoldsSuperInu] = useState(false);
  const [stakesSuperInu, setStakesSuperInu] = useState(false);

  // Sticker selection (stake-only extra option)
  const [selectedSticker, setSelectedSticker] = useState<'holder' | 'staker'>('holder');

  const stickerRef = useRef<StickerOverlayHandle>(null);

  // Upload handler
  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoURL(URL.createObjectURL(file));
  }

  // Miniapp actions
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

  // Fetch wallets + on-chain status
  useEffect(() => {
    if (!fid) return;

    let cancelled = false;
    (async () => {
      try {
        setLoadingStatus(true);
        setStatusError(null);

        // 1) Get All Wallets (custody + verifications) from your working Neynar proxy route
        const uRes = await fetch(`/api/neynar/users?fid=${fid}`, { cache: 'no-store' });
        if (!uRes.ok) throw new Error(`User fetch failed: ${uRes.status}`);
        const u = (await uRes.json()) as UserResp;

        const custody = (u.custody_address ?? '').toLowerCase();
        const ver = (u.verifications ?? []).map((a) => a.toLowerCase());
        const all = Array.from(new Set([...(custody ? [custody] : []), ...ver]));
        if (!cancelled) setAllWallets(all);

        // If no wallets, stop early
        if (all.length === 0) {
          if (!cancelled) {
            setHoldsSuperInu(false);
            setStakesSuperInu(false);
          }
          return;
        }

        // 2) Holdings check (Alchemy-powered route)
        const hRes = await fetch('/api/superinu/holdings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: all }),
        });
        if (!hRes.ok) throw new Error(`Holdings fetch failed: ${hRes.status}`);
        const hJson = (await hRes.json()) as HoldingsResp;
        const holds = (hJson.holders ?? []).length > 0;

        // 3) Staked check (Alchemy-powered route)
        const sRes = await fetch('/api/superinu/staked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: all }),
        });
        if (!sRes.ok) throw new Error(`Staked fetch failed: ${sRes.status}`);
        const sJson = (await sRes.json()) as HoldingsResp;
        const stakes = (sJson.holders ?? []).length > 0;

        if (!cancelled) {
          setHoldsSuperInu(holds);
          setStakesSuperInu(stakes);

          // If they’re staking and currently on "editor", default the staker sticker
          if (stakes) setSelectedSticker('staker');
        }
      } catch (e) {
        if (!cancelled) {
          setStatusError(e instanceof Error ? e.message : 'Failed to load status');
          setHoldsSuperInu(false);
          setStakesSuperInu(false);
        }
      } finally {
        if (!cancelled) setLoadingStatus(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fid]);

  // Compute progress X/2
  const progress = useMemo(() => {
    const score = (holdsSuperInu ? 1 : 0) + (stakesSuperInu ? 1 : 0);
    return `${score}/2`;
  }, [holdsSuperInu, stakesSuperInu]);

  // Selected sticker URL
  const stickerUrl = useMemo(() => {
    if (selectedSticker === 'staker' && stakesSuperInu) return '/superinuStaker.png';
    return '/superinuMain2.png';
  }, [selectedSticker, stakesSuperInu]);

  const canUseSticker = holdsSuperInu; // gate editor functions

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

      {/* Progress pill */}
      <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
        Ownership Progress: <span className="font-semibold">{progress}</span>
        {loadingStatus && <span className="ml-2 text-gray-500">Checking…</span>}
        {statusError && <span className="ml-2 text-red-500">Error: {statusError}</span>}
      </div>

      {/* Editor tab */}
      {activeTab === 'editor' && (
        <div className="m-4 p-6 bg-white dark:bg-gray-800 border-2 border-[#52a842] dark:border-[#4ccc84] rounded-2xl shadow-lg space-y-6 text-center w-full max-w-md transition-colors">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#52a842] to-[#4ccc84] text-transparent bg-clip-text dark:from-[#bbf7d0] dark:to-[#86efac]">
            🐶 Meme Your SuperInu Moment
          </h1>

          {/* Gate notice */}
          {!canUseSticker && (
            <div className="text-sm p-3 rounded-lg bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              You need to hold <span className="font-semibold">$SUPERINU</span> to use the sticker editor.
              {!loadingStatus && (
                <div className="mt-2 flex justify-center gap-2">
                  <button
                    onClick={handleBuy}
                    className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={handleStake}
                    className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Stake Now
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="text-gray-700 dark:text-gray-300">
            Upload or snap a photo to start creating your personalized SuperInu image!
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="w-full text-sm text-gray-700 dark:text-gray-200 file:bg-[#52a842] file:hover:bg-[#3e8d35] file:text-white file:rounded-lg file:px-4 file:py-2 file:border-none transition-colors"
            disabled={!canUseSticker}
          />

          {/* Staker sticker toggle (only if staking) */}
          {canUseSticker && stakesSuperInu && (
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Sticker:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSticker('holder')}
                  className={`px-3 py-1 rounded-md border ${
                    selectedSticker === 'holder'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Holder
                </button>
                <button
                  onClick={() => setSelectedSticker('staker')}
                  className={`px-3 py-1 rounded-md border ${
                    selectedSticker === 'staker'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Staker
                </button>
              </div>
            </div>
          )}

          {canUseSticker && photoURL && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">PREVIEW WITH STICKER</p>

              <StickerOverlay
                ref={stickerRef}
                photoUrl={photoURL}
                stickerUrl={stickerUrl}
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