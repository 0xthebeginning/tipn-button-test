'use client';

import { useMemo } from 'react';
import { useMiniApp } from '@neynar/react';

type MiniAppUser = {
  fid?: number;
  username?: string;
  display_name?: string;
  custody_address?: string | null;
  verifications?: string[]; // verified EVM addresses
};

export default function YourStats() {
  const { context } = useMiniApp();

  // Safely coerce the user shape without using `any`
  const miniUser: MiniAppUser | undefined = useMemo(() => {
    return context?.user
      ? (context.user as unknown as MiniAppUser)
      : undefined;
  }, [context?.user]);

  const fid = miniUser?.fid ?? null;
  const custodyAddress =
    typeof miniUser?.custody_address === 'string' ? miniUser.custody_address : null;
  const verifiedWallets = Array.isArray(miniUser?.verifications)
    ? miniUser!.verifications
    : [];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md shadow">
      <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Your Stats</h2>

      {/* FID */}
      <div className="text-sm mb-3">
        <span className="text-gray-600 dark:text-gray-300">FID:&nbsp;</span>
        <span className="font-mono text-gray-900 dark:text-gray-100">
          {fid ?? '—'}
        </span>
      </div>

      {/* Custody Address */}
      <div className="text-sm mb-3">
        <span className="text-gray-600 dark:text-gray-300">Custody Address:&nbsp;</span>
        <span className="font-mono break-all text-gray-900 dark:text-gray-100">
          {custodyAddress ?? '—'}
        </span>
      </div>

      {/* Verified Wallets */}
      <div className="text-sm">
        <span className="text-gray-600 dark:text-gray-300">Verified Wallets:</span>
        {verifiedWallets.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {verifiedWallets.map((addr) => (
              <li key={addr} className="font-mono break-all text-gray-900 dark:text-gray-100">
                {addr}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-gray-500 dark:text-gray-400">No wallets found.</p>
        )}
      </div>
    </div>
  );
}