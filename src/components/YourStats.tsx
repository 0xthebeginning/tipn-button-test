// src/components/YourStats.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMiniApp } from '@neynar/react';

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

export default function YourStats() {
  const { context } = useMiniApp();
  const fid = context?.user?.fid ?? null;

  const [custody, setCustody] = useState<string | null>(null);
  const [verified, setVerified] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [holders, setHolders] = useState<string[]>([]);
  const isHolder = useMemo(() => holders.length > 0, [holders]);

  useEffect(() => {
    if (!fid) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrMsg(null);
      try {
        // 1) Get custody + verified wallets via your /api/user proxy
        const uRes = await fetch(`/api/user?fid=${fid}`, { cache: 'no-store' });
        if (!uRes.ok) throw new Error(`User fetch failed: ${uRes.status}`);
        const data = (await uRes.json()) as WarpcastUserResp;
        const u = data.result?.user;

        const custodyAddr = u?.custodyAddress ?? null;
        const verifiedAddrs = (u?.verifications ?? []).map((a) => a.toLowerCase());

        if (!cancelled) {
          setCustody(custodyAddr);
          setVerified(verifiedAddrs);
        }

        // 2) Holder check via /api/holdings (Etherscan v2)
        if (verifiedAddrs.length > 0) {
          const hRes = await fetch('/api/superinu/holdings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addresses: verifiedAddrs }),
          });
          if (!hRes.ok) throw new Error(`Holdings fetch failed: ${hRes.status}`);
          const h = (await hRes.json()) as HoldingsResp;

          if (!cancelled) {
            setHolders(h.holders ?? []);
          }
        } else {
          if (!cancelled) setHolders([]);
        }
      } catch (e) {
        if (!cancelled) setErrMsg(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fid]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow text-left space-y-3">
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

      <div className="text-sm">
        <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Verified Wallets</div>
        {verified.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {verified.map((addr) => {
              const has = holders.includes(addr);
              return (
                <li key={addr} className="font-mono break-all">
                  <span className={has ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}>
                    {addr} {has ? '— ✅ holds $SuperInu' : '— ❌'}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500">No verified wallets found.</p>
        )}
      </div>

      <p className="text-sm">
        Overall Holder:{" "}
        <span className={isHolder ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
          {isHolder ? 'Yes' : 'No'}
        </span>
      </p>
    </div>
  );
}