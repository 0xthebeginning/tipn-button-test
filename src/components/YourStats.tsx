'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMiniApp } from '@neynar/react';

/** ---------- Shared hook (exported) ---------- */
export type AddressCheck = { address: string; ok: boolean; balance: string; error?: string };
export type SuperInuStatus = {
  fid: number | null;
  custody: string | null;
  verified: string[];
  allWallets: string[];
  isHolder: boolean;
  isStaker: boolean;
  loadingUser: boolean;
  loadingHoldings: boolean;
  loadingStake: boolean;
  errorUser: string | null;
  errorHoldings: string | null;
  errorStake: string | null;
  holdingsResults: AddressCheck[];
  stakingResults: AddressCheck[];
};

type UseSuperInuStatusOptions = {
  /** Optional additional addresses (e.g., from WalletConnect). */
  extraAddresses?: string[];
};

function isAddr(x: string): x is `0x${string}` {
  return /^0x[a-f0-9]{40}$/.test(x);
}

export function useSuperInuStatus(opts: UseSuperInuStatusOptions = {}): SuperInuStatus {
  const { context } = useMiniApp();
  const fid = context?.user?.fid ?? null;

  const [custody, setCustody] = useState<string | null>(null);
  const [verified, setVerified] = useState<string[]>([]);

  // normalize & validate the optional extra addresses
  const extraJoined = (opts.extraAddresses ?? []).join('|'); // stable dep key
  const extra = useMemo(
    () =>
      (opts.extraAddresses ?? [])
        .map((a) => (typeof a === 'string' ? a.trim().toLowerCase() : ''))
        .filter(isAddr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extraJoined]
  );

  const allWallets = useMemo(() => {
    const base = [...(custody ? [custody] : []), ...verified, ...extra];
    return [...new Set(base.map((a) => a.toLowerCase()))];
  }, [custody, verified, extra]);

  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingHoldings, setLoadingHoldings] = useState(false);
  const [loadingStake, setLoadingStake] = useState(false);

  const [errorUser, setErrorUser] = useState<string | null>(null);
  const [errorHoldings, setErrorHoldings] = useState<string | null>(null);
  const [errorStake, setErrorStake] = useState<string | null>(null);

  const [holdingsResults, setHoldingsResults] = useState<AddressCheck[]>([]);
  const [stakingResults, setStakingResults] = useState<AddressCheck[]>([]);

  const isHolder = useMemo(() => holdingsResults.some((r) => r.ok), [holdingsResults]);
  const isStaker = useMemo(() => stakingResults.some((r) => r.ok), [stakingResults]);

  // 1) Get user wallets via our Neynar proxy (only if we have a fid)
  useEffect(() => {
    if (!fid) return; // allow extra-only flow when opened outside FC
    let cancelled = false;

    (async () => {
      setLoadingUser(true);
      setErrorUser(null);
      try {
        const res = await fetch(`/api/neynar/users?fid=${fid}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`User fetch failed: ${res.status}`);
        const data: { fid: number; custody_address: string | null; verifications: string[] } =
          await res.json();
        if (!cancelled) {
          setCustody(data.custody_address ?? null);
          setVerified((data.verifications ?? []).map((a) => a.toLowerCase()).filter(isAddr));
        }
      } catch (e) {
        if (!cancelled) setErrorUser(e instanceof Error ? e.message : 'Failed to load user');
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fid]);

  // 2) Check holdings via our Alchemy-backed route
  useEffect(() => {
    if (allWallets.length === 0) {
      setHoldingsResults([]);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoadingHoldings(true);
      setErrorHoldings(null);
      try {
        const res = await fetch('/api/superinu/holdings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: allWallets }),
        });
        if (!res.ok) throw new Error(`Holdings fetch failed: ${res.status}`);
        const json: { results: AddressCheck[] } = await res.json();
        if (!cancelled) setHoldingsResults(json.results ?? []);
      } catch (e) {
        if (!cancelled) setErrorHoldings(e instanceof Error ? e.message : 'Failed to load holdings');
      } finally {
        if (!cancelled) setLoadingHoldings(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [allWallets.join('|')]);

  // 3) Check staked via our Alchemy-backed route
  useEffect(() => {
    if (allWallets.length === 0) {
      setStakingResults([]);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoadingStake(true);
      setErrorStake(null);
      try {
        const res = await fetch('/api/superinu/staked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: allWallets }),
        });
        if (!res.ok) throw new Error(`Staked fetch failed: ${res.status}`);
        const json: { results: AddressCheck[] } = await res.json();
        if (!cancelled) setStakingResults(json.results ?? []);
      } catch (e) {
        if (!cancelled) setErrorStake(e instanceof Error ? e.message : 'Failed to load staked');
      } finally {
        if (!cancelled) setLoadingStake(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [allWallets.join('|')]);

  return {
    fid,
    custody,
    verified,
    allWallets,
    isHolder,
    isStaker,
    loadingUser,
    loadingHoldings,
    loadingStake,
    errorUser,
    errorHoldings,
    errorStake,
    holdingsResults,
    stakingResults,
  };
}

/** ---------- UI component (uses the same hook) ---------- */
export default function YourStats() {
  const s = useSuperInuStatus();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow text-left space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Stats</h2>

      {s.fid ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          FID: <span className="font-mono">{s.fid}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-500">Open in Farcaster to see FID.</p>
      )}

      {/* All wallets (custody + verified + extra) */}
      <div className="text-sm">
        <div className="font-semibold text-gray-800 dark:text-gray-200">
          All Wallets <span className="opacity-70">({s.allWallets.length})</span>
        </div>
        <details className="mt-1">
          <summary className="cursor-pointer text-gray-600 dark:text-gray-300">Show list</summary>
          <ul className="mt-2 space-y-1">
            {s.allWallets.map((a) => (
              <li key={a} className="font-mono text-xs break-all">
                {a}
              </li>
            ))}
          </ul>
        </details>
      </div>

      {/* Holdings */}
      <div className="text-sm">
        <div className="font-semibold text-gray-800 dark:text-gray-200">Holds $SuperInu?</div>
        {s.loadingHoldings && <p className="text-gray-500">Checking…</p>}
        {s.errorHoldings && <p className="text-red-500">Error: {s.errorHoldings}</p>}
        {!s.loadingHoldings && !s.errorHoldings && (
          <p
            className={
              s.isHolder ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
            }
          >
            {s.isHolder ? 'Yes' : 'No'}
          </p>
        )}
        {s.holdingsResults.length > 0 && (
          <details className="mt-1">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-300">Details</summary>
            <ul className="mt-2 space-y-1">
              {s.holdingsResults.map((r) => (
                <li key={r.address} className="font-mono text-xs break-all">
                  {short(r.address)} — {r.ok ? `balance: ${r.balance}` : r.error ? `error: ${r.error}` : 'no tokens'}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* Staked */}
      <div className="text-sm">
        <div className="font-semibold text-gray-800 dark:text-gray-200">Staking $SuperInu?</div>
        {s.loadingStake && <p className="text-gray-500">Checking…</p>}
        {s.errorStake && <p className="text-red-500">Error: {s.errorStake}</p>}
        {!s.loadingStake && !s.errorStake && (
          <p
            className={
              s.isStaker ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
            }
          >
            {s.isStaker ? 'Yes' : 'No'}
          </p>
        )}
        {s.stakingResults.length > 0 && (
          <details className="mt-1">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-300">Details</summary>
            <ul className="mt-2 space-y-1">
              {s.stakingResults.map((r) => (
                <li key={r.address} className="font-mono text-xs break-all">
                  {short(r.address)} — {r.ok ? `balance: ${r.balance}` : r.error ? `error: ${r.error}` : 'no stake'}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}