'use client';

import { useMemo } from 'react';
import { useMiniApp } from '@neynar/react';

export default function YourStats() {
  const { context } = useMiniApp();
  const user = context?.user;

  // Verified EVM addresses linked to the Farcaster account
  const verifiedWallets = (user?.verifications ?? []) as string[];
  // Custody address for the account (may be different from verified wallets)
  const custodyAddress = (user?.custody_address ?? null) as string | null;

  const primaryDisplay = useMemo(() => {
    if (verifiedWallets.length > 0) return verifiedWallets[0];
    if (custodyAddress) return custodyAddress;
    return null;
  }, [verifiedWallets, custodyAddress]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow">
      <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">Your Stats</h2>

      {user?.fid ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          FID: <span className="font-mono">{user.fid}</span>
        </p>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">FID unavailable</p>
      )}

      {primaryDisplay ? (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-200 break-all mb-2">
            Primary Wallet:{' '}
            <span className="font-mono">{primaryDisplay}</span>
          </p>

          {verifiedWallets.length > 0 ? (
            <div className="mt-2">
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">Verified Wallets:</p>
              <ul className="text-xs space-y-1">
                {verifiedWallets.map((addr) => (
                  <li key={addr} className="font-mono break-all text-gray-600 dark:text-gray-300">
                    {addr}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              No verified wallets found. Showing custody address instead.
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No wallets found for this user.
        </p>
      )}
    </div>
  );
}