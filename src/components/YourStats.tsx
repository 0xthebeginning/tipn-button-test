'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMiniApp } from '@neynar/react';

type NeynarProxyUser = {
  fid: number;
  custody_address: string | null;
  verifications: string[];
};

type HoldingItem = { address: string; ok: boolean; balance: string };
type HoldingsResp = { holders: string[]; results: HoldingItem[]; error?: string };

type StakedItem = { address: string; ok: boolean; balance: string };
type StakedResp = { stakers: string[]; results: StakedItem[]; error?: string };

export default function YourStats() {
  const { context } = useMiniApp();
  const fid = context?.user?.fid ?? null;

  const [custody, setCustody] = useState<string | null>(null);
  const [verified, setVerified] = useState<string[]>([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userErr, setUserErr] = useState<string | null>(null);

  const [holders, setHolders] = useState<string[]>([]);
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [loadingHold, setLoadingHold] = useState(false);
  const [holdErr, setHoldErr] = useState<string | null>(null);

  const [stakers, setStakers] = useState<string[]>([]);
  const [staked, setStaked] = useState<StakedItem[]>([]);
  const [loadingStake, setLoadingStake] = useState(false);
  const [stakeErr, setStakeErr] = useState<string | null>(null);

  const isHolder = useMemo(() => holders.length > 0, [holders]);
  const isStaker = useMemo(() => stakers.length > 0, [stakers]);

  // 1) Fetch user wallets from your Neynar proxy
  useEffect(() => {
    if (!fid) return;
    let cancelled = false;

    (async () => {
      setLoadingUser(true);
      setUserErr(null);
      try {
        const res = await fetch(`/api/neynar/users?fid=${fid}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`User fetch failed: ${res.status}`);
        const data: NeynarProxyUser = await res.json();

        if (cancelled) return;

        setCustody(data.custody_address ?? null);
        // Normalize + dedupe
        const list = Array.from(new Set((data.verifications ?? []).map(a => a.toLowerCase())));
        setVerified(list);
      } catch (e) {
        if (!cancelled) setUserErr(e instanceof Error ? e.message : 'Failed to load user');
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();

    return () => { cancelled = true; };
  }, [fid]);

  // 2) Holdings check (Etherscan route)
  useEffect(() => {
    if (verified.length === 0) return;
    let cancelled = false;

    (async () => {
      setLoadingHold(true);
      setHoldErr(null);
      try {
        const res = await fetch('/api/superinu/holdings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: verified }),
        });
        if (!res.ok) throw new Error(`Holdings fetch failed: ${res.status}`);
        const data: HoldingsResp = await res.json();
        if (cancelled) return;

        setHolders(data.holders ?? []);
        setHoldings(data.results ?? []);
      } catch (e) {
        if (!cancelled) setHoldErr(e instanceof Error ? e.message : 'Failed to load holdings');
      } finally {
        if (!cancelled) setLoadingHold(false);
      }
    })();

    return () => { cancelled = true; };
  }, [verified]);

  // 3) Staked check (your staked route)
  useEffect(() => {
    if (verified.length === 0) return;
    let cancelled = false;

    (async () => {
      setLoadingStake(true);
      setStakeErr(null);
      try {
        const res = await fetch('/api/superinu/staked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: verified }),
        });
        if (!res.ok) throw new Error(`Staked fetch failed: ${res.status}`);
        const data: StakedResp = await res.json();
        if (cancelled) return;

        setStakers(data.stakers ?? []);
        setStaked(data.results ?? []);
      } catch (e) {
        if (!cancelled) setStakeErr(e instanceof Error ? e.message : 'Failed to load staked balances');
      } finally {
        if (!cancelled) setLoadingStake(false);
      }
    })();

    return () => { cancelled = true; };
  }, [verified]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow text-left space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Stats</h2>

      {/* FID */}
      <div className="text-sm">
        <div className="font-semibold text-gray-800 dark:text-gray-200">FID</div>
        {fid ? (
          <p className="font-mono text-gray-700 dark:text-gray-300">{fid}</p>
        ) : (
          <p className="text-gray-500">Open this in Farcaster to see your FID.</p>
        )}
      </div>

      {/* User + wallets */}
      {loadingUser && <p className="text-sm text-gray-500">Loading user…</p>}
      {userErr && <p className="text-sm text-red-500">Error: {userErr}</p>}

      {custody && (
        <div className="text-sm">
          <div className="font-semibold text-gray-800 dark:text-gray-200">Custody Address</div>
          <p className="font-mono break-all text-gray-700 dark:text-gray-300">{custody}</p>
        </div>
      )}

      <div className="text-sm">
        <div className="font-semibold text-gray-800 dark:text-gray-200">Verified Wallets</div>
        {verified.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {verified.map(addr => (
              <li key={addr} className="font-mono break-all text-gray-700 dark:text-gray-300">{addr}</li>
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
              {holdings.map(h => (
                <li key={h.address} className="font-mono text-xs break-all">
                  {h.address} — {h.ok ? `balance: ${h.balance}` : 'no balance'}
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
              {staked.map(s => (
                <li key={s.address} className="font-mono text-xs break-all">
                  {s.address} — {s.ok ? `staked: ${s.balance}` : 'no stake'}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}