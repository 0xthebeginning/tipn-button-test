// src/components/YourStats.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMiniApp } from '@neynar/react';

type UserResp = {
  fid: number;
  custody_address: string | null;
  verifications: string[];
};

type AddrResult = {
  address: string;
  ok: boolean;
  balance: string; // wei string
  error?: string;
};

type HoldingsResp = {
  token: string;
  chainid: number;
  holders: string[];
  results: AddrResult[];
  error?: string;
};

type StakedResp = {
  token: string;
  chainid: number;
  holders: string[];
  results: AddrResult[];
  error?: string;
};

export default function YourStats() {
  const { context } = useMiniApp();
  const fid = context?.user?.fid ?? null;

  const [custody, setCustody] = useState<string | null>(null);
  const [verified, setVerified] = useState<string[]>([]);

  const [holdings, setHoldings] = useState<AddrResult[]>([]);
  const [staked, setStaked] = useState<AddrResult[]>([]);

  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingHold, setLoadingHold] = useState(false);
  const [loadingStake, setLoadingStake] = useState(false);

  const [userErr, setUserErr] = useState<string | null>(null);
  const [holdErr, setHoldErr] = useState<string | null>(null);
  const [stakeErr, setStakeErr] = useState<string | null>(null);

  // Fetch user -> custody + verified
  useEffect(() => {
    if (!fid) return;
    let cancelled = false;

    (async () => {
      setLoadingUser(true);
      setUserErr(null);
      try {
        const res = await fetch(`/api/neynar/users?fid=${fid}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: UserResp = await res.json();

        const v = (data.verifications ?? []).map((a) => a.toLowerCase());
        if (!cancelled) {
          setCustody(data.custody_address ?? null);
          setVerified(v);
        }
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

  // Fetch holdings for verified wallets
  useEffect(() => {
    if (verified.length === 0) {
      setHoldings([]);
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
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: HoldingsResp = await res.json();
        if (!cancelled) setHoldings(data.results ?? []);
      } catch (e) {
        if (!cancelled) setHoldErr(e instanceof Error ? e.message : 'Holdings fetch failed');
      } finally {
        if (!cancelled) setLoadingHold(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [verified]);

  // Fetch staked balances for verified wallets
  useEffect(() => {
    if (verified.length === 0) {
      setStaked([]);
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
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: StakedResp = await res.json();
        if (!cancelled) setStaked(data.results ?? []);
      } catch (e) {
        if (!cancelled) setStakeErr(e instanceof Error ? e.message : 'Staked fetch failed');
      } finally {
        if (!cancelled) setLoadingStake(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [verified]);

  // Derived flags (use the actual results arrays, not holders[])
  const isHolder = useMemo(() => {
    return holdings.some((r) => {
      if (!r.ok) return false;
      try {
        return BigInt(r.balance) > 0n;
      } catch {
        return false;
      }
    });
  }, [holdings]);

  const isStaker = useMemo(() => {
    return staked.some((r) => {
      if (!r.ok) return false;
      try {
        return BigInt(r.balance) > 0n;
      } catch {
        return false;
      }
    });
  }, [staked]);

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
      {loadingUser && <p className="text-sm text-gray-500">Loading profile…</p>}
      {userErr && <p className="text-sm text-red-500">Error: {userErr}</p>}

      {/* Custody */}
      {custody && (
        <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
          Custody: <span className="font-mono">{custody}</span>
        </p>
      )}

      {/* Verified Wallets */}
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

      {/* Holder */}
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
                  {h.address} — {h.ok ? `balance: ${h.balance}` : (h.error ?? 'error')}
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
                  {s.address} — {s.ok ? `staked: ${s.balance}` : (s.error ?? 'no stake')}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}