// src/components/YourStats.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMiniApp } from '@neynar/react';

type UserProxyResp = {
  result?: {
    user?: {
      custodyAddress?: string | null;
      verifications?: string[]; // EVM addresses
    };
  };
  error?: { message?: string };
};

type HoldingsResp = {
  holders: string[]; // lowercased addresses that have balance > 0
  results: { address: string; ok: boolean; balance: string }[];
  error?: string;
};

export default function YourStats() {
  const { context } = useMiniApp();
  const fid = context?.user?.fid ?? null;

  const [custody, setCustody] = useState<string | null>(null);
  const [verified, setVerified] = useState<string[]>([]);
  const [holders, setHolders] = useState<string[]>([]);
  const [stakers, setStakers] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const isHolder = useMemo(() => holders.length > 0, [holders]);
  const isStaker = useMemo(() => stakers.length > 0, [stakers]);

  useEffect(() => {
    if (!fid) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrMsg(null);
      try {
        // 1) Get custody + verified wallets via your Neynar proxy
        const uRes = await fetch(`/api/neynar/users?fid=${fid}`, { cache: 'no-store' });
        if (!uRes.ok) throw new Error(`User fetch failed: ${uRes.status}`);
        const data = (await uRes.json()) as UserProxyResp;

        const u = data.result?.user;
        const custodyAddr = u?.custodyAddress ?? null;
        const verifiedAddrs = (u?.verifications ?? []).map((a) => a.toLowerCase());

        if (!cancelled) {
          setCustody(custodyAddr ?? null);
          setVerified(verifiedAddrs);
        }

        if (verifiedAddrs.length > 0) {
          // 2) Holdings (ERC-20) check
          const hRes = await fetch('/api/superinu/holdings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addresses: verifiedAddrs }),
          });
          if (!hRes.ok) throw new Error(`Holdings fetch failed: ${hRes.status}`);
          const h = (await hRes.json()) as HoldingsResp;
          if (!cancelled) setHolders(h.holders ?? []);

          // 3) Staked token check
          const sRes = await fetch('/api/superinu/staked', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addresses: verifiedAddrs }),
          });
          if (!sRes.ok) throw new Error(`Staked fetch failed: ${sRes.status}`);
          const s = (await sRes.json()) as HoldingsResp;
          if (!cancelled) setStakers(s.holders ?? []);
        } else {
          if (!cancelled) {
            setHolders([]);
            setStakers([]);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setErrMsg(e instanceof Error ? e.message : 'Failed to load data');
          setHolders([]);
          setStakers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fid]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow text-left space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Stats</h2>

      {fid ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          FID: <span className="font-mono">{fid}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-500">Open this in Farcaster to see your FID.</p>
      )}

      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {errMsg && <p className="text-sm text-red-500">Error: {errMsg}</p>}

      {custody && (
        <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
          Custody: <span className="font-mono">{custody}</span>
        </p>
      )}

      {/* Verified wallets with per-wallet badges */}
      <div className="text-sm space-y-1">
        <div className="font-semibold text-gray-800 dark:text-gray-200">Verified Wallets</div>
        {verified.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {verified.map((addr) => {
              const hasHold = holders.includes(addr);
              const hasStake = stakers.includes(addr);
              return (
                <li key={addr} className="font-mono break-all text-gray-700 dark:text-gray-300">
                  {addr}
                  <span className="ml-2">
                    {hasHold ? (
                      <span className="text-green-600 dark:text-green-400">• holds $SuperInu</span>
                    ) : (
                      <span className="text-gray-400">• no hold</span>
                    )}
                    {'  '}
                    {hasStake ? (
                      <span className="text-indigo-500">• staked</span>
                    ) : (
                      <span className="text-gray-400">• not staked</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500">No verified wallets found.</p>
        )}
      </div>

      {/* Overall flags */}
      <div className="text-sm space-y-1">
        <p>
          Overall Holder:{' '}
          <span className={isHolder ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
            {isHolder ? 'Yes' : 'No'}
          </span>
        </p>
        <p>
          Overall Staker:{' '}
          <span className={isStaker ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
            {isStaker ? 'Yes' : 'No'}
          </span>
        </p>
      </div>
    </div>
  );
}