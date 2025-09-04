// src/components/YourStats.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMiniApp } from '@neynar/react';
import { formatUnits } from 'viem';

type WarpcastUserResp = {
  fid: number;
  custody_address?: string | null;
  verifications?: string[];
  error?: string;
};

type HoldingsResp = {
  token: string;
  holders: string[];
  results: { address: string; ok: boolean; balance: string; error?: string }[];
  error?: string;
};

type StakeResp = {
  token: string;
  holders: string[];
  results: { address: string; ok: boolean; balance: string; error?: string }[];
  error?: string;
};

const DECIMALS = 18; // SUPERINU decimals
const SYMBOL = 'SUPERINU';

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function fmt(amountWei: string) {
  try {
    const human = formatUnits(BigInt(amountWei), DECIMALS);
    // Add grouping, trim trailing zeros nicely
    const [intPart, fracPart = ''] = human.split('.');
    const grouped = new Intl.NumberFormat().format(Number(intPart));
    const trimmedFrac = fracPart.replace(/0+$/, '');
    return trimmedFrac ? `${grouped}.${trimmedFrac}` : grouped;
  } catch {
    return '0';
  }
}

export default function YourStats() {
  const { context } = useMiniApp();
  const fid = context?.user?.fid ?? null;

  const [custody, setCustody] = useState<string | null>(null);
  const [verified, setVerified] = useState<string[]>([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userErr, setUserErr] = useState<string | null>(null);

  const [holds, setHolds] = useState<HoldingsResp | null>(null);
  const [loadingHold, setLoadingHold] = useState(false);
  const [holdErr, setHoldErr] = useState<string | null>(null);

  const [staked, setStaked] = useState<StakeResp | null>(null);
  const [loadingStake, setLoadingStake] = useState(false);
  const [stakeErr, setStakeErr] = useState<string | null>(null);

  // Fetch Neynar user (custody + verifications) via your existing proxy route.
  useEffect(() => {
    if (!fid) return;
    let cancelled = false;

    (async () => {
      setLoadingUser(true);
      setUserErr(null);
      try {
        const res = await fetch(`/api/neynar/users?fid=${fid}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`User fetch failed: ${res.status}`);
        const data = (await res.json()) as WarpcastUserResp;
        if (cancelled) return;

        const v = (data.verifications ?? []).map((a) => a.toLowerCase());
        setVerified(v);
        setCustody((data.custody_address ?? null) as string | null);
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

  // Holdings
  useEffect(() => {
    if (verified.length === 0) {
      setHolds(null);
      setHoldErr(null);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoadingHold(true);
      setHoldErr(null);
      try {
        const res = await fetch('/api/superinu/holdings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: verified }),
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`Holdings fetch failed: ${res.status}`);
        const data = (await res.json()) as HoldingsResp;
        if (!cancelled) setHolds(data);
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

  // Staked
  useEffect(() => {
    if (verified.length === 0) {
      setStaked(null);
      setStakeErr(null);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoadingStake(true);
      setStakeErr(null);
      try {
        const res = await fetch('/api/superinu/staked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: verified }),
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`Staked fetch failed: ${res.status}`);
        const data = (await res.json()) as StakeResp;
        if (!cancelled) setStaked(data);
      } catch (e) {
        if (!cancelled) setStakeErr(e instanceof Error ? e.message : 'Failed to load staked');
      } finally {
        if (!cancelled) setLoadingStake(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [verified]);

  const isHolder = useMemo(() => (holds?.holders?.length ?? 0) > 0, [holds]);
  const isStaker = useMemo(() => (staked?.holders?.length ?? 0) > 0, [staked]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow text-left space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Stats</h2>

      {/* FID */}
      {fid ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          FID: <span className="font-mono">{fid}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-500">Open this in Farcaster to see your FID.</p>
      )}

      {/* Custody + Wallets */}
      {loadingUser && <p className="text-sm text-gray-500">Loading your wallets…</p>}
      {userErr && <p className="text-sm text-red-500">Error: {userErr}</p>}

      {custody && (
        <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
          Custody: <span className="font-mono">{custody}</span>
        </p>
      )}

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
          !loadingUser && <p className="text-gray-500">No verified wallets found.</p>
        )}
      </div>

      {/* Holdings */}
      <div className="text-sm">
        <div className="font-semibold text-gray-800 dark:text-gray-200">Holds ${SYMBOL}?</div>
        {loadingHold && <p className="text-gray-500">Checking…</p>}
        {holdErr && <p className="text-red-500">Error: {holdErr}</p>}
        {!loadingHold && !holdErr && (
          <p className={isHolder ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
            {isHolder ? 'Yes' : 'No'}
          </p>
        )}

        {holds?.results && holds.results.length > 0 && (
          <details className="mt-1">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-300">Details</summary>
            <ul className="mt-2 space-y-1">
              {holds.results.map((r) => {
                const has = r.ok && r.balance !== '0';
                const line =
                  r.error
                    ? `error: ${r.error}`
                    : `balance: ${fmt(r.balance)} ${SYMBOL}`;
                return (
                  <li key={`hold-${r.address}`} className="font-mono text-xs break-all">
                    {shortAddr(r.address)} — {has ? '✅ ' : '❌ '} {line}
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </div>

      {/* Staked */}
      <div className="text-sm">
        <div className="font-semibold text-gray-800 dark:text-gray-200">Staking ${SYMBOL}?</div>
        {loadingStake && <p className="text-gray-500">Checking…</p>}
        {stakeErr && <p className="text-red-500">Error: {stakeErr}</p>}
        {!loadingStake && !stakeErr && (
          <p className={isStaker ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
            {isStaker ? 'Yes' : 'No'}
          </p>
        )}

        {staked?.results && staked.results.length > 0 && (
          <details className="mt-1">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-300">Details</summary>
            <ul className="mt-2 space-y-1">
              {staked.results.map((r) => {
                const has = r.ok && r.balance !== '0';
                const line =
                  r.error
                    ? `error`
                    : `balance: ${fmt(r.balance)} ${SYMBOL}`;
                return (
                  <li key={`stk-${r.address}`} className="font-mono text-xs break-all">
                    {shortAddr(r.address)} — {has ? '✅ ' : '❌ '} {line}
                    {r.error ? `: ${r.error}` : ''}
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}