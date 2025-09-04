// src/components/YourStats.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMiniApp } from '@neynar/react';

type UserResp = {
  fid: number;
  custody_address: string | null;
  verifications: string[];
};

type BalanceRow = {
  address: string;
  ok: boolean;
  balance: string;    // wei string
  error?: string;
};

type BalancesResp = {
  token: string;
  holders?: string[];
  results: BalanceRow[];
  error?: string;
};

const DECIMALS = 18;

// helpers
function shortAddr(addr: string) {
  const a = addr.toLowerCase();
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
function formatToken(wei: string, decimals = DECIMALS) {
  try {
    const big = BigInt(wei);
    const base = 10n ** BigInt(decimals);
    const whole = big / base;
    const frac = big % base;
    const fracStr = frac.toString().padStart(decimals, '0').slice(0, 6).replace(/0+$/, '');
    const core = fracStr ? `${whole.toString()}.${fracStr}` : whole.toString();
    return core.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } catch {
    return '0';
  }
}
function uniqLower(addresses: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of addresses) {
    const low = a.toLowerCase();
    if (/^0x[a-f0-9]{40}$/.test(low) && !seen.has(low)) {
      seen.add(low);
      out.push(low);
    }
  }
  return out;
}

export default function YourStats() {
  const { context } = useMiniApp();
  const fid = context?.user?.fid ?? null;

  const [custody, setCustody] = useState<string | null>(null);
  const [verified, setVerified] = useState<string[]>([]);

  const [loadingUser, setLoadingUser] = useState(false);
  const [userErr, setUserErr] = useState<string | null>(null);

  // holdings
  const [loadingHold, setLoadingHold] = useState(false);
  const [holdErr, setHoldErr] = useState<string | null>(null);
  const [holdRows, setHoldRows] = useState<BalanceRow[]>([]);

  // staked
  const [loadingStake, setLoadingStake] = useState(false);
  const [stakeErr, setStakeErr] = useState<string | null>(null);
  const [stakeRows, setStakeRows] = useState<BalanceRow[]>([]);

  // 🔗 All wallets = custody + verifications (de-duped, lowercase). Custody first if present.
  const allWallets = useMemo(() => {
    const list = [...verified];
    if (custody) list.unshift(custody);
    return uniqLower(list);
  }, [custody, verified]);

  // Top-level flags derived from actual rows
  const isHolder = useMemo(() => holdRows.some(r => r.ok), [holdRows]);
  const isStaker = useMemo(() => stakeRows.some(r => r.ok), [stakeRows]);

  // Load user (custody + verifications)
  useEffect(() => {
    if (!fid) return;

    let cancelled = false;
    (async () => {
      setLoadingUser(true);
      setUserErr(null);
      try {
        const res = await fetch(`/api/neynar/users?fid=${fid}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`User fetch failed: ${res.status}`);
        const data = (await res.json()) as UserResp;

        if (!cancelled) {
          setCustody(data.custody_address ?? null);
          setVerified(Array.isArray(data.verifications) ? data.verifications.map(a => a.toLowerCase()) : []);
        }
      } catch (e) {
        if (!cancelled) setUserErr(e instanceof Error ? e.message : 'Failed to load user');
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();

    return () => { cancelled = true; };
  }, [fid]);

  // Query holdings + staked for ALL wallets
  useEffect(() => {
    if (allWallets.length === 0) {
      setHoldRows([]);
      setStakeRows([]);
      return;
    }

    let cancelled = false;

    // Holdings
    (async () => {
      setLoadingHold(true);
      setHoldErr(null);
      try {
        const r = await fetch('/api/superinu/holdings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: allWallets }),
        });
        if (!r.ok) throw new Error(`Holdings fetch failed: ${r.status}`);
        const j = (await r.json()) as BalancesResp;
        if (!cancelled) setHoldRows(Array.isArray(j.results) ? j.results : []);
      } catch (e) {
        if (!cancelled) setHoldErr(e instanceof Error ? e.message : 'Failed to load holdings');
      } finally {
        if (!cancelled) setLoadingHold(false);
      }
    })();

    // Staked
    (async () => {
      setLoadingStake(true);
      setStakeErr(null);
      try {
        const r = await fetch('/api/superinu/staked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: allWallets }),
        });
        if (!r.ok) throw new Error(`Staked fetch failed: ${r.status}`);
        const j = (await r.json()) as BalancesResp;
        if (!cancelled) setStakeRows(Array.isArray(j.results) ? j.results : []);
      } catch (e) {
        if (!cancelled) setStakeErr(e instanceof Error ? e.message : 'Failed to load staked');
      } finally {
        if (!cancelled) setLoadingStake(false);
      }
    })();

    return () => { cancelled = true; };
  }, [allWallets]);

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

      {/* User load/errors */}
      {loadingUser && <p className="text-sm text-gray-500">Loading user…</p>}
      {userErr && <p className="text-sm text-red-500">Error: {userErr}</p>}

      {/* All Wallets */}
      <div className="text-sm">
        <div className="font-semibold text-gray-800 dark:text-gray-200">
          All Wallets <span className="font-normal text-gray-600 dark:text-gray-400">({allWallets.length})</span>
        </div>
        {allWallets.length > 0 ? (
          <details className="mt-1">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-300">Show list</summary>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              {allWallets.map((addr) => (
                <li key={addr} className="font-mono break-all text-gray-700 dark:text-gray-300">
                  {addr}
                </li>
              ))}
            </ul>
          </details>
        ) : (
          <p className="text-gray-500">No wallets found.</p>
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
        {holdRows.length > 0 && (
          <details className="mt-1">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-300">Details</summary>
            <ul className="mt-2 space-y-1">
              {holdRows.map((row) => (
                <li key={`hold-${row.address}`} className="font-mono text-xs break-all">
                  {shortAddr(row.address)} —{' '}
                  {row.error
                    ? `error: ${row.error}`
                    : row.ok
                      ? `balance: ${formatToken(row.balance)} SUPERINU`
                      : 'no tokens'}
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
        {stakeRows.length > 0 && (
          <details className="mt-1">
            <summary className="cursor-pointer text-gray-600 dark:text-gray-300">Details</summary>
            <ul className="mt-2 space-y-1">
              {stakeRows.map((row) => (
                <li key={`stake-${row.address}`} className="font-mono text-xs break-all">
                  {shortAddr(row.address)} —{' '}
                  {row.error
                    ? `error: ${row.error}`
                    : row.ok
                      ? `balance: ${formatToken(row.balance)} SUPERINU`
                      : 'no stake'}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
