// src/components/YourStats.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMiniApp } from '@neynar/react';

type NeynarUserResp = {
  fid?: number;
  custody_address?: string | null;
  verifications?: string[]; // lowercase hex strings expected from your route
  error?: string;
};

type BalanceItem = {
  address: string;
  ok: boolean;
  balance: string; // wei (as decimal string)
  error?: string;
};

type HoldingsResp = {
  token: string;
  holders: string[];
  results: BalanceItem[];
  error?: string;
};

type StakedResp = {
  token: string;
  stakers: string[];
  results: BalanceItem[];
  error?: string;
};

export default function YourStats() {
  const { context } = useMiniApp();
  const fid = context?.user?.fid ?? null;

  const [custody, setCustody] = useState<string | null>(null);
  const [verified, setVerified] = useState<string[]>([]);

  const [holdings, setHoldings] = useState<BalanceItem[]>([]);
  const [staked, setStaked] = useState<BalanceItem[]>([]);

  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingHold, setLoadingHold] = useState(false);
  const [loadingStake, setLoadingStake] = useState(false);

  const [userErr, setUserErr] = useState<string | null>(null);
  const [holdErr, setHoldErr] = useState<string | null>(null);
  const [stakeErr, setStakeErr] = useState<string | null>(null);

  // Overall booleans
  const isHolder = useMemo(
    () => holdings.some((h) => h.ok),
    [holdings]
  );
  const isStaker = useMemo(
    () => staked.some((s) => s.ok),
    [staked]
  );

  // 1) Load wallet info from your Neynar proxy
  useEffect(() => {
    if (!fid) return;

    let cancelled = false;
    setLoadingUser(true);
    setUserErr(null);

    (async () => {
      try {
        const res = await fetch(`/api/neynar/users?fid=${fid}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`User fetch failed: ${res.status}`);
        const data = (await res.json()) as NeynarUserResp;

        if (cancelled) return;

        if (data.error) throw new Error(data.error);

        const verifs = (data.verifications ?? []).map((a) => a.toLowerCase());
        setCustody(data.custody_address ?? null);
        setVerified(verifs);
      } catch (e) {
        if (!cancelled) setUserErr(e instanceof Error ? e.message : 'Failed to load user');
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fid]);

  // 2) Check SuperInu ERC-20 holdings via Alchemy-powered route
  useEffect(() => {
    if (verified.length === 0) {
      setHoldings([]);
      return;
    }

    let cancelled = false;
    setLoadingHold(true);
    setHoldErr(null);

    (async () => {
      try {
        const res = await fetch('/api/superinu/holdings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: verified }),
        });
        if (!res.ok) throw new Error(`Holdings fetch failed: ${res.status}`);
        const data = (await res.json()) as HoldingsResp;
        if (cancelled) return;

        if (data.error) throw new Error(data.error);
        setHoldings(data.results ?? []);
      } catch (e) {
        if (!cancelled) setHoldErr(e instanceof Error ? e.message : 'Failed to load holdings');
      } finally {
        if (!cancelled) setLoadingHold(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [verified]);

  // 3) Check staked token balances via Alchemy-powered route
  useEffect(() => {
    if (verified.length === 0) {
      setStaked([]);
      return;
    }

    let cancelled = false;
    setLoadingStake(true);
    setStakeErr(null);

    (async () => {
      try {
        const res = await fetch('/api/superinu/staked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: verified }),
        });
        if (!res.ok) throw new Error(`Staked fetch failed: ${res.status}`);
        const data = (await res.json()) as StakedResp;
        if (cancelled) return;

        if (data.error) throw new Error(data.error);
        setStaked(data.results ?? []);
      } catch (e) {
        if (!cancelled) setStakeErr(e instanceof Error ? e.message : 'Failed to load staked balances');
      } finally {
        if (!cancelled) setLoadingStake(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [verified]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow text-left space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Stats</h2>

      {/* FID */}
      {fid ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          FID: <span className="font-mono">{fid}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-500">Open in Farcaster to see your FID.</p>
      )}

      {/* User load/error */}
      {loadingUser && <p className="text-sm text-gray-500">Loading account…</p>}
      {userErr && <p className="text-sm text-red-500">Error: {userErr}</p>}

      {/* Custody */}
      {custody && (
        <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
          Custody: <span className="font-mono">{custody}</span>
        </p>
      )}

      {/* Verified wallets */}
      <div className="text-sm">
        <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Verified Wallets</div>
        {verified.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {verified.map((addr) => (
              <li key={addr} className="font-mono break-all text-gray-700 dark:text-gray-300">
                {addr}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No verified wallets found.</p>
        )}
      </div>

      {/* Holdings */}
      <div className="text-sm">
        <div className="font-semibold text-gray-800 dark:text-gray-200">Holds $SuperInu?</div>
        {loadingHold && <p className="text-gray-500">Checking…</p>}
        {holdErr && <p className="text-red-500">Error: {holdErr}</p>}
        {!loadingHold && !holdErr && (
          <p className={isHolder ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
            {isHolder ? 'Yes' : 'No'}
          </p>
        )}

        {holdings.length > 0 && (
          <details className="mt-1">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-300">Details</summary>
            <ul className="mt-2 space-y-1">
              {holdings.map((h) => (
                <li key={h.address} className="font-mono text-xs break-all">
                  {h.address} — {h.ok ? `balance: ${h.balance}` : h.error ? `error: ${h.error}` : 'no tokens'}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* Staked */}
      <div className="text-sm">
        <div className="font-semibold text-gray-800 dark:text-gray-200">Staking $SuperInu?</div>
        {loadingStake && <p className="text-gray-500">Checking…</p>}
        {stakeErr && <p className="text-red-500">Error: {stakeErr}</p>}
        {!loadingStake && !stakeErr && (
          <p className={isStaker ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
            {isStaker ? 'Yes' : 'No'}
          </p>
        )}

        {staked.length > 0 && (
          <details className="mt-1">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-300">Details</summary>
            <ul className="mt-2 space-y-1">
              {staked.map((s) => (
                <li key={s.address} className="font-mono text-xs break-all">
                  {s.address} — {s.ok ? `balance: ${s.balance}` : s.error ? `error: ${s.error}` : 'no stake'}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}