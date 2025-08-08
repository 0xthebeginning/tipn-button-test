// src/components/YourStats.tsx
'use client';

import { useEffect, useState } from 'react';
import { useMiniApp } from '@neynar/react';

type NeynarUser = {
  fid?: number;
  custody_address?: string | null;
  verifications?: string[]; // verified EVM addresses
};

type UsersResponse = {
  users?: NeynarUser[];
  error?: string;
};

export default function YourStats() {
  const { context } = useMiniApp();
  const userFid = context?.user?.fid ?? null;

  const [fid, setFid] = useState<number | null>(null);
  const [custody, setCustody] = useState<string | null>(null);
  const [verified, setVerified] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!userFid) {
      // Not running inside Farcaster or no user yet
      setFid(null);
      setCustody(null);
      setVerified([]);
      return;
    }

    setFid(userFid);
    setLoading(true);
    setErrMsg(null);

    (async () => {
      try {
        const res = await fetch(`/api/neynar/users?fids=${userFid}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`API ${res.status}`);
        }
        const data: UsersResponse = await res.json();

        const u = data.users?.[0];
        setCustody(u?.custody_address ?? null);
        setVerified(Array.isArray(u?.verifications) ? u!.verifications! : []);
      } catch (e) {
        setErrMsg(e instanceof Error ? e.message : 'Failed to load wallets');
        setCustody(null);
        setVerified([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userFid]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow text-left space-y-3">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Stats</h2>

      {fid ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          FID: <span className="font-mono">{fid}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          Open this in Farcaster to see your FID.
        </p>
      )}

      {loading && <p className="text-sm text-gray-500">Loading wallets…</p>}

      {errMsg && (
        <p className="text-sm text-red-500">
          Couldn’t fetch wallets: {errMsg}
        </p>
      )}

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
        ) : !loading && (
          <p className="text-gray-500">No verified wallets found.</p>
        )}
      </div>
    </div>
  );
}