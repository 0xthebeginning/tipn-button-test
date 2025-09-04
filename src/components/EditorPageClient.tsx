// src/components/EditorPageClient.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import StickerOverlay, { StickerOverlayHandle } from './StickerOverlay';
import sdk from '@farcaster/miniapp-sdk';
import YourStats from './YourStats';
import { useMiniApp } from '@neynar/react';

type TabKey = 'editor' | 'stats' | 'about';
type StickerChoice = 'regular' | 'staker';

type WarpcastUserResp = {
  result?: {
    user?: {
      fid?: number;
      custodyAddress?: string;
      verifications?: string[];
    };
  };
  error?: { message?: string };
};

type HoldingsResp = {
  holders: string[];
  results: { address: string; ok: boolean; balance: string }[];
  error?: string;
};

export default function EditorPageClient() {
  const { context } = useMiniApp();
  const fid = context?.user?.fid ?? null;

  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('editor');
  const stickerRef = useRef<StickerOverlayHandle>(null);

  // eligibility
  const [loadingElig, setLoadingElig] = useState(false);
  const [eligErr, setEligErr] = useState<string | null>(null);
  const [verified, setVerified] = useState<string[]>([]);
  const [isHolder, setIsHolder] = useState(false);
  const [isStaker, setIsStaker] = useState(false);

  // sticker choice
  const [stickerChoice, setStickerChoice] = useState<StickerChoice>('regular');

  const statusFraction = useMemo(() => {
    let score = 0;
    if (isHolder) score += 1;
    if (isStaker) score += 1;
    return `${score}/2`;
  }, [isHolder, isStaker]);

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

  // Fetch wallets -> check holdings & staked (server routes already exist)
  useEffect(() => {
    if (!fid) return;

    let cancelled = false;

    (async () => {
      try {
        setLoadingElig(true);
        setEligErr(null);

        // 1) wallets
        const uRes = await fetch(`/api/neynar/users?fid=${fid}`, { cache: 'no-store' });
        if (!uRes.ok) throw new Error(`wallets ${uRes.status}`);
        const user = (await uRes.json()) as WarpcastUserResp;
        const v = (user.result?.user?.verifications ?? []).map((a) => a.toLowerCase());
        if (!cancelled) setVerified(v);

        if (v.length === 0) {
          if (!cancelled) {
            setIsHolder(false);
            setIsStaker(false);
          }
          return;
        }

        // 2) holdings
        const hRes = await fetch('/api/superinu/holdings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: v }),
        });
        if (!hRes.ok) throw new Error(`holdings ${hRes.status}`);
        const holdings = (await hRes.json()) as HoldingsResp;
        const holder = (holdings.holders ?? []).length > 0;

        // 3) staked
        const sRes = await fetch('/api/superinu/staked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: v }),
        });
        if (!sRes.ok) throw new Error(`staked ${sRes.status}`);
        const staked = (await sRes.json()) as HoldingsResp; // same shape: { holders, results }
        const staker = (staked.holders ?? []).length > 0;

        if (!cancelled) {
          setIsHolder(holder);
          setIsStaker(staker);

          // auto-select staker sticker if eligible
          setStickerChoice(staker ? 'staker' : 'regular');
        }
      } catch (e) {
        if (!cancelled) {
          setEligErr(e instanceof Error ? e.message : 'eligibility failed');
          setIsHolder(false);
          setIsStaker(false);
        }
      } finally {
        if (!cancelled) setLoadingElig(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fid]);

  const chosenStickerUrl =
    stickerChoice === 'staker' ? '/superinuStaker.png' : '/superinuMain2.png';

  const canEdit = isHolder; // must hold to use stickers

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

      {/* Eligibility chip */}
      <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
        Status: <span className="font-semibold">{statusFraction}</span>{' '}
        <span className="ml-2">
          {loadingElig
            ? 'Checking…'
            : eligErr
            ? `Error: ${eligErr}`
            : isHolder
            ? isStaker
              ? '(Holder + Staker)'
              : '(Holder)'
            : '(Not Holder)'}
        </span>
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

          {/* Sticker selector */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setStickerChoice('regular')}
              className={`px-3 py-1 rounded-lg text-sm border ${
                stickerChoice === 'regular'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Regular
            </button>
            <button
              onClick={() => {
                if (isStaker) setStickerChoice('staker');
              }}
              disabled={!isStaker}
              className={`px-3 py-1 rounded-lg text-sm border ${
                !isStaker
                  ? 'opacity-50 cursor-not-allowed bg-white dark:bg-gray-700 text-gray-500'
                  : stickerChoice === 'staker'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
              title={!isStaker ? 'Stake to unlock' : 'Staker sticker'}
            >
              Staker
            </button>
          </div>

          {/* Upload input */}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="w-full text-sm text-gray-700 dark:text-gray-200 file:bg-[#52a842] file:hover:bg-[#3e8d35] file:text-white file:rounded-lg file:px-4 file:py-2 file:border-none transition-colors"
          />

          {/* Guard: must be a holder */}
          {!canEdit && (
            <div className="rounded-xl border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-3 text-sm">
              You need to hold <b>$SUPERINU</b> in at least one verified wallet to use stickers.
              <div className="mt-2 flex justify-center">
                <button
                  onClick={handleBuy}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"
                >
                  Buy Now
                </button>
              </div>
            </div>
          )}

          {photoURL && canEdit && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">PREVIEW WITH STICKER</p>

              <StickerOverlay
                ref={stickerRef}
                photoUrl={photoURL}
                stickerUrl={chosenStickerUrl}
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
          {/* quick peek of wallets used for eligibility */}
          {verified.length > 0 && (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-gray-700 dark:text-gray-300">
                Wallets used for eligibility
              </summary>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {verified.map((a) => (
                  <li key={a} className="font-mono break-all text-gray-700 dark:text-gray-300">
                    {a}
                  </li>
                ))}
              </ul>
            </details>
          )}
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
        </div>
      )}
    </main>
  );
}